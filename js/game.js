// ═══════════════════════════════════════════════════════
//  LIZETH TSUNAMI — game.js  (reescritura completa)
// ═══════════════════════════════════════════════════════

const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');

// ── Resize ──────────────────────────────────────────────
function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resize);
resize();

// ── Assets globales ─────────────────────────────────────
const IMG = {
    bg1:       loadCached('assets/background.png'),
    bg2:       loadCached('assets/background2.png'),
    coin:      loadCached('assets/monedas.png'),
    bread:     loadCached('assets/pan.png'),
    barrel:    loadCached('assets/barril.png'),
    balla:     loadCached('assets/balla.png'),
    auto:      loadCached('assets/auto.png'),
    barrera2:  loadCached('assets/barrera2.png'),
    box:       loadCached('assets/caja.png'),
    salchi:    loadCached('assets/salchipapa.png'),
};

// ── Sonidos ─────────────────────────────────────────────
const SFX = {
    coin:  new Audio('assets/moneda.mp3'),
    bread: new Audio('assets/pan.mp3'),
    expl:  new Audio('assets/explosion.mp3'),
};
function sfx(name, vol = 1) {
    try { const s = SFX[name].cloneNode(); s.volume = vol; s.play(); } catch(_) {}
}

// ── Música ──────────────────────────────────────────────
const PLAYLIST = ['assets/musica2.mp3','assets/musica1.mp3','assets/musica3.mp3','assets/musica4.mp3'];
let musicIdx = 0, bgMusic = null, musicOn = false;

function playMusic() {
    if (bgMusic) bgMusic.pause();
    bgMusic         = new Audio(PLAYLIST[musicIdx]);
    bgMusic.volume  = 0.7;
    bgMusic.onended = () => { musicIdx = (musicIdx + 1) % PLAYLIST.length; playMusic(); bgMusic.play().catch(()=>{}); };
}

function startMusicOnce() {
    if (!musicOn && bgMusic) {
        bgMusic.play().then(() => { musicOn = true; }).catch(() => {});
    }
}

// ── Fondo infinito ──────────────────────────────────────
function drawBg(ox) {
    const b1 = IMG.bg1, b2 = IMG.bg2;
    if (!b1.complete || !b1.naturalHeight || !b2.complete) return;
    const sc   = canvas.height / b1.naturalHeight;
    const w1   = b1.naturalWidth * sc;
    const w2   = b2.naturalWidth * sc;
    const tot  = w1 + w2;
    let x = ox % tot;
    if (x > 0) x -= tot;
    while (x < canvas.width) {
        ctx.drawImage(b1, x, 0, w1, canvas.height); x += w1;
        ctx.drawImage(b2, x, 0, w2, canvas.height); x += w2;
    }
}

// ── Letras de monedas ────────────────────────────────────
const LETRAS = {
    'T':[[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    'E':[[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,1,1,1]],
    'A':[[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    'M':[[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
    'O':[[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    'I':[[0,1,1,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
    'C':[[0,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,1]],
    'G':[[0,1,1,1,1],[1,0,0,0,0],[1,1,0,1,1],[1,0,0,0,1],[0,1,1,1,1]],
    'H':[[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    'Q':[[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,1,0],[0,1,1,1,1]],
    'U':[[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    'N':[[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1]],
    'X':[[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
    'R':[[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,1]],
    'Ñ':[[1,1,1,0,0],[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1]],
    '1':[[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
    ':':[[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0]],
    ' ':[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
};
const FRASES = ['TE EXTRAÑO','TE AMO','MI CIEGA','MI CHIQUITA','MI ENOJONA','11:11'];

// ── Constantes de juego ──────────────────────────────────
const GROUND_PCT  = 0.92;
const BASE_SPD    = 5.5;
const DELAY_FR    = 8;
const MAX_HORDE   = 30;

// ── Estado global ────────────────────────────────────────
let selectedSkin = 1;
window.gameActive = false;

let horde, actionBuf, explosions, items, obstacles, boxes;
let gold, nextSkin, bgX, spd, spawnT, startT, intro, tsTimer, lastSpX;
let loopId = null;

function groundY() { return canvas.height * GROUND_PCT - 96; }

// ── Selección de skin ────────────────────────────────────
window.selectSkin = function(id, el) {
    selectedSkin = id;
    document.querySelectorAll('.skin-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    sfx('bread');
    menuP = null; // refrescar personaje del menú
};

// ── Colisión AABB ────────────────────────────────────────
function hits(a, b, margin = 0) {
    return a.x + margin       < b.x + b.width  &&
           a.x + a.width - margin > b.x          &&
           a.y + margin       < b.y + b.height  &&
           a.y + a.height - margin > b.y;
}

// ── Spawnear palabra de monedas ──────────────────────────
function spawnWord(frase, sx, gy) {
    const sp = 25, ls = 45;
    let cx = sx;
    for (const ch of frase.toUpperCase()) {
        const m = LETRAS[ch] || LETRAS[' '];
        for (let r = 0; r < 5; r++)
            for (let c = 0; c < 5; c++)
                if (m[r][c]) items.push(new Item('gold', cx + c*sp, (gy-250) + r*sp, IMG.coin));
        cx += 5*sp + ls;
    }
}

// ── Agregar a la horda ───────────────────────────────────
function addToHorde(skinId, jump = false) {
    const alive = horde.filter(p => !p.dying);
    if (alive.length >= MAX_HORDE) return;
    const sid = skinId || nextSkin;
    horde.push(new Player(sid, false, jump));
    if (!skinId && nextSkin <= 4) nextSkin = nextSkin % 4 + 1;
    sfx('bread');
    updateUI();
}

function updateUI() {
    const n = horde.filter(p => !p.dying).length;
    document.getElementById('lizeth-count').textContent = n;
}

// ── Patrón de spawn ──────────────────────────────────────
function spawnPattern(gy) {
    if (intro || !window.gameActive) return;
    if (canvas.width - lastSpX < 450) return;
    const x = canvas.width + 100;
    const r = Math.random();
    if (r < 0.015) {
        items.push(new Item('salchipapa', x, gy - 160, IMG.salchi)); lastSpX = x;
    } else if (r < 0.065) {
        boxes.push(new Box(x, gy - 4, IMG.box)); lastSpX = x;
    } else if (r < 0.515) {
        const r2 = Math.random();
        if      (r2 < 0.25) obstacles.push(new Paloma(x, gy - 130));
        else if (r2 < 0.45) obstacles.push(new Obstacle(x, gy - 4,   IMG.balla,    'balla'));
        else if (r2 < 0.65) obstacles.push(new Obstacle(x, gy - 35,  IMG.barrera2, 'barrera2'));
        else if (r2 < 0.85) obstacles.push(new Obstacle(x, gy - 24,  IMG.barrel,   'barril'));
        else                 obstacles.push(new Obstacle(x, gy - 4,   IMG.auto,     'auto'));
        lastSpX = x;
    } else {
        if (Math.random() < 0.5) {
            items.push(new Item('bread', x, gy - 140, IMG.bread)); lastSpX = x;
        } else {
            for (let i = 0; i < 6; i++)
                items.push(new Item('gold', x + i*75, (gy+20) - Math.sin((i/5)*Math.PI)*180, IMG.coin));
            lastSpX = x + 450;
        }
    }
}

// ── Salto del líder ──────────────────────────────────────
window.leaderJump = function() {
    if (!window.gameActive) return;
    const alive = horde.filter(p => !p.dying);
    if (alive.length) { alive[0].doJump(); startMusicOnce(); }
};

// ── Init / Reset ─────────────────────────────────────────
function initGame() {
    window.gameActive = false;
    if (loopId !== null) { cancelAnimationFrame(loopId); loopId = null; }

    horde      = [new Player(selectedSkin, true)];
    nextSkin   = selectedSkin <= 4 ? selectedSkin % 4 + 1 : 1;
    actionBuf  = []; explosions = []; items = []; obstacles = []; boxes = [];
    gold       = 0;
    bgX        = 0;
    spd        = BASE_SPD;
    spawnT     = 0;
    startT     = Date.now();
    intro      = true;
    tsTimer    = 0;
    lastSpX    = 0;

    document.getElementById('main-menu').style.display       = 'none';
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('ui').style.display              = 'flex';
    document.getElementById('gold-count').textContent        = '0';
    updateUI();

    playMusic();

    window.gameActive = true;

    // Primera frase después de que el personaje llega a posición
    setTimeout(() => {
        if (window.gameActive) spawnWord(FRASES[Math.floor(Math.random()*FRASES.length)], canvas.width+100, groundY());
    }, 1200);

    gameLoop();
}

// ── Fullscreen ───────────────────────────────────────────
function tryFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
}

// ── GAME LOOP ─────────────────────────────────────────────
function gameLoop() {
    if (!window.gameActive) return;
    loopId = requestAnimationFrame(gameLoop);

    // ── limpiar canvas (sin filters pendientes) ──────────
    ctx.setTransform(1,0,0,1,0,0);  // reset transform
    ctx.globalAlpha   = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ── tiempo y velocidad ───────────────────────────────
    const gt = (Date.now() - startT) / 1000;
    if (gt >= 15) intro = false;
    spd = gt < 15 ? BASE_SPD
        : gt < 45 ? BASE_SPD + 1.5
        : BASE_SPD + 3.5 + Math.sin(gt * 0.3) * 2;

    // ── fondo ────────────────────────────────────────────
    bgX -= spd;
    drawBg(bgX);

    const gy    = groundY();
    const alive = horde.filter(p => !p.dying);

    // ── tsunami mode ─────────────────────────────────────
    if (alive.length >= 15 && tsTimer <= 0) tsTimer = 300;
    if (tsTimer > 0) tsTimer--;

    // ── GAME OVER check ───────────────────────────────────
    // Solo cuando la horda está completamente vacía
    if (horde.length === 0) {
        window.gameActive = false;
        cancelAnimationFrame(loopId); loopId = null;
        document.getElementById('game-over-screen').style.display = 'flex';
        return;
    }

    // ── Actualizar líder ─────────────────────────────────
    if (alive.length > 0) {
        const leader = alive[0];
        leader.isLeader = true;

        // ¿está sobre una caja?
        let floor = gy;
        for (const b of boxes) {
            if (leader.x + leader.w > b.x + 20 && leader.x < b.x + b.w - 20 &&
                leader.y + leader.h <= b.y + 35 && leader.vy >= 0) {
                floor        = b.y - leader.h;
                leader.state = 'onBox';
            }
        }
        leader.updateAsLeader(floor);

        actionBuf.push({ x: leader.x, y: leader.y, state: leader.state, frame: leader.frame, vy: leader.vy });
        if (actionBuf.length > 600) actionBuf.shift();

        for (let i = 1; i < alive.length; i++) {
            const snap = actionBuf[actionBuf.length - 1 - i * DELAY_FR] || actionBuf[0];
            alive[i].isLeader = false;
            alive[i].updateAsFollower(snap, i);
        }
    }

    // ── Actualizar/limpiar muriendo ───────────────────────
    for (let i = horde.length - 1; i >= 0; i--) {
        const p = horde[i];
        if (p.dying) {
            p.updateAsLeader(gy);
            // Eliminar cuando ya salió de pantalla o llevan mucho tiempo
            if (p.deathT > 80 || p.x + p.w < -150) {
                horde.splice(i, 1);
                updateUI();
            }
        } else if (p.x < -80) {
            p.triggerDeath();
        }
    }

    // ── Spawn timer ───────────────────────────────────────
    if (++spawnT > 35) { spawnPattern(gy); spawnT = 0; }
    lastSpX -= spd;

    // ── CAJAS ─────────────────────────────────────────────
    for (let i = boxes.length - 1; i >= 0; i--) {
        const b = boxes[i];
        b.update(spd);
        b.draw(ctx);

        let touching = false;
        for (const p of alive) {
            if (p.y + p.h > b.y + 10 && p.x + p.w > b.x + 5 && p.x < b.x + b.w - 15) {
                touching = true;
                p.x = b.x - p.w + 5;
            }
        }
        b.pushed = touching && alive.length >= 3;

        if (b.pushed) {
            b.hp -= 3.5;
            if (b.hp <= 0) {
                explosions.push(new Explosion(b.x, b.y));
                sfx('expl');
                boxes.splice(i, 1);
                addToHorde(5, true);
                continue;
            }
        }
        if (boxes[i] && b.x < -400) boxes.splice(i, 1);
    }

    // ── OBSTÁCULOS ────────────────────────────────────────
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.update(spd);
        obs.draw(ctx);

        let collided = false;
        for (const p of alive) {
            const margin = obs instanceof Paloma ? 15 : 35;
            if (hits(p, obs, margin)) {
                explosions.push(new Explosion(obs.x, obs.y));
                sfx('expl');
                obstacles.splice(i, 1);
                collided = true;
                if (tsTimer <= 0) { p.triggerDeath(); updateUI(); }
                break;
            }
        }
        if (collided) continue;
        if (obs.x < -400) obstacles.splice(i, 1);
    }

    // ── EXPLOSIONES ───────────────────────────────────────
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].update(spd);
        explosions[i].draw(ctx);
        if (explosions[i].done) explosions.splice(i, 1);
    }

    // ── ITEMS ─────────────────────────────────────────────
    for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.update(spd);
        it.draw(ctx);
        let picked = false;
        for (const p of alive) {
            if (hits(p, it, -15)) {
                picked = true;
                if (it.type === 'gold') {
                    gold++;
                    document.getElementById('gold-count').textContent = gold;
                    sfx('coin', 0.05);
                } else if (it.type === 'bread') {
                    addToHorde(null, true);
                } else if (it.type === 'salchipapa') {
                    addToHorde(5, true); addToHorde(7, true);
                }
                break;
            }
        }
        if (picked || it.x < -1200) items.splice(i, 1);
    }

    // ── DIBUJAR HORDA ────────────────────────────────────
    // Ordenar por Y para que los de atrás se dibujen primero
    const sorted = [...horde].sort((a, b) => (a.y + a.offY) - (b.y + b.offY));
    for (const p of sorted) p.draw(ctx, tsTimer > 0);

    // ── garantizar estado limpio del canvas ───────────────
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
}

// ── MENÚ ANIMADO ─────────────────────────────────────────
let menuP   = null;
let menuBgX = 0;
let menuId  = null;

function drawMenu() {
    if (window.gameActive) return;
    menuId = requestAnimationFrame(drawMenu);

    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    menuBgX -= 2;
    drawBg(menuBgX);

    if (!menuP || menuP.skinID !== selectedSkin) {
        menuP = new Player(selectedSkin, true);
    }
    menuP.x     = canvas.width / 2 - 48;
    menuP.y     = groundY();
    menuP.state = 'run';
    menuP.frame = Math.floor(Date.now() / 100) % 4;
    menuP.draw(ctx, false);
}

// ── Botones ───────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', () => {
    tryFullscreen();
    if (menuId !== null) { cancelAnimationFrame(menuId); menuId = null; }
    initGame();
});

document.getElementById('restart-btn').addEventListener('click', () => {
    tryFullscreen();
    if (menuId !== null) { cancelAnimationFrame(menuId); menuId = null; }
    initGame();
});

// ── Arrancar menú ─────────────────────────────────────────
drawMenu();
