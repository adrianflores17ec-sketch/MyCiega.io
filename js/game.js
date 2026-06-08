// =====================================================
// SETUP CANVAS
// =====================================================
const canvas = document.getElementById("game");
const ctx    = canvas.getContext("2d");

let selectedLeaderSkin = 1;
let menuBgX            = 0;
window.gameActive      = false;

window.selectSkin = function(skinId, element) {
    selectedLeaderSkin = skinId;
    document.querySelectorAll('.skin-card').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    if (breadSound) breadSound.cloneNode().play().catch(() => {});
    menuPlayer = null; // fuerza recrear el player del menú con nueva skin
};

function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
}
window.addEventListener("resize", resize);
resize();

// =====================================================
// FONDO INFINITO
// =====================================================
function drawInfiniteBackground(offsetX) {
    if (!bg1.complete || !bg2.complete || !bg1.naturalHeight) return;
    const scale  = canvas.height / bg1.naturalHeight;
    const bg1W   = bg1.naturalWidth * scale;
    const bg2W   = bg2.naturalWidth * scale;
    const totalW = bg1W + bg2W;
    let x = offsetX % totalW;
    if (x > 0) x -= totalW;
    while (x < canvas.width) {
        ctx.drawImage(bg1, x, 0, bg1W, canvas.height); x += bg1W;
        ctx.drawImage(bg2, x, 0, bg2W, canvas.height); x += bg2W;
    }
}

// =====================================================
// ASSETS GLOBALES
// =====================================================
const LETRAS_COIN = {
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
    ' ':[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
};

const FRASES  = ["TE EXTRAÑO","TE AMO","MI CIEGA","MI CHIQUITA","MI ENOJONA","11:11"];
const playlist = ["assets/musica2.mp3","assets/musica1.mp3","assets/musica3.mp3","assets/musica4.mp3"];
let musicIndex = 0, currentBgMusic = null, musicStarted = false;

const coinSound   = new Audio("assets/moneda.mp3");
const breadSound  = new Audio("assets/pan.mp3");
const explSound   = new Audio("assets/explosion.mp3");

const bg1         = new Image(); bg1.src = "assets/background.png";
const bg2         = new Image(); bg2.src = "assets/background2.png";
const coinImg     = new Image(); coinImg.src = "assets/monedas.png";
const breadImg    = new Image(); breadImg.src = "assets/pan.png";
const barrelImg   = new Image(); barrelImg.src = "assets/barril.png";
const ballaImg    = new Image(); ballaImg.src = "assets/balla.png";
const autoImg     = new Image(); autoImg.src = "assets/auto.png";
const barrera2Img = new Image(); barrera2Img.src = "assets/barrera2.png";
const boxImg      = new Image(); boxImg.src = "assets/caja.png";
const salchipapaImg = new Image(); salchipapaImg.src = "assets/salchipapa.png";

const palomaFrames = [];
for (let i = 1; i <= 5; i++) {
    const img = new Image(); img.src = `assets/paloma/paloma${i}.png`;
    palomaFrames.push(img);
}

// =====================================================
// ESTADO DEL JUEGO
// =====================================================
const GROUND_PERCENT = 0.92;
const BASE_SPEED     = 5.5;
const DELAY_FRAMES   = 8;

let actionBuffer, explosions, items, obstacles, boxes;
let goldScore, nextSkinId, bgX, bgSpeed;
let spawnTimer, startTime, introActive, tsunamiTimer, lastSpawnX;
let animationId = null;

// =====================================================
// MÚSICA
// =====================================================
function setupMusic() {
    if (currentBgMusic) { currentBgMusic.pause(); }
    currentBgMusic         = new Audio(playlist[musicIndex]);
    currentBgMusic.volume  = 0.7;
    currentBgMusic.onended = () => {
        musicIndex = (musicIndex + 1) % playlist.length;
        setupMusic();
        currentBgMusic.play().catch(() => {});
    };
}

// =====================================================
// INICIAR JUEGO
// =====================================================
function initGame() {
    // Detener loop anterior limpiamente
    window.gameActive = false;
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    // Reset estado
    window.horde = [new Player(selectedLeaderSkin, true)];
    nextSkinId   = (selectedLeaderSkin <= 4) ? (selectedLeaderSkin % 4) + 1 : 1;

    actionBuffer = []; explosions = []; items = []; obstacles = []; boxes = [];
    goldScore    = 0;
    bgX          = 0;
    bgSpeed      = BASE_SPEED;
    spawnTimer   = 0;
    startTime    = Date.now();
    introActive  = true;
    tsunamiTimer = 0;
    lastSpawnX   = 0;

    document.getElementById("main-menu").style.display      = "none";
    document.getElementById("game-over-screen").style.display = "none";
    document.getElementById("ui").style.display             = "flex";
    document.getElementById("gold-count").innerText         = "0";
    updateUI();

    if (!musicStarted) setupMusic();

    // Esperar un poco antes de activar el loop para que el DOM se actualice
    setTimeout(() => {
        window.gameActive = true;
        // Frase inicial
        spawnWord(
            FRASES[Math.floor(Math.random() * FRASES.length)],
            canvas.width + 100,
            groundYNow()
        );
        gameLoop();
    }, 50);
}

function groundYNow() {
    return (canvas.height * GROUND_PERCENT) - 96;
}

// =====================================================
// SALTO DEL LÍDER
// =====================================================
window.leaderJump = () => {
    if (!window.gameActive) return;
    const alive = window.horde.filter(p => !p.isDying);
    if (alive.length > 0) {
        alive[0].jump();
        if (!musicStarted && currentBgMusic) {
            currentBgMusic.play().then(() => { musicStarted = true; }).catch(() => {});
        }
    }
};

// =====================================================
// HORDA
// =====================================================
function addToHorde(skinId = null, jump = false) {
    if (window.horde.filter(p => !p.isDying).length >= 30) return;
    const finalSkin = skinId || nextSkinId;
    window.horde.push(new Player(finalSkin, false, jump));
    if (skinId === null && nextSkinId <= 4) nextSkinId = (nextSkinId % 4) + 1;
    breadSound.cloneNode().play().catch(() => {});
    updateUI();
}

function updateUI() {
    document.getElementById("lizeth-count").innerText =
        window.horde.filter(p => !p.isDying).length;
}

// =====================================================
// SPAWN DE PALABRAS Y PATRONES
// =====================================================
function spawnWord(frase, startX, groundY) {
    const coinSp = 25, letSp = 45;
    let curX = startX;
    for (const char of frase.toUpperCase()) {
        const matrix = LETRAS_COIN[char] || LETRAS_COIN[' '];
        for (let r = 0; r < matrix.length; r++)
            for (let c = 0; c < matrix[r].length; c++)
                if (matrix[r][c] === 1)
                    items.push(new Item('gold', curX + c * coinSp, (groundY - 250) + r * coinSp, coinImg));
        curX += 5 * coinSp + letSp;
    }
}

function spawnPattern(groundY) {
    if (introActive || !window.gameActive) return;
    if (canvas.width - lastSpawnX < 450) return;

    const chance = Math.random();
    const xPos   = canvas.width + 100;

    if (chance < 0.015) {
        items.push(new Item('salchipapa', xPos, groundY - 160, salchipapaImg));
        lastSpawnX = xPos;
    } else if (chance < 0.065) {
        boxes.push(new Box(xPos, groundY - 4, boxImg));
        lastSpawnX = xPos;
    } else if (chance < 0.515) {
        const r = Math.random();
        if      (r < 0.25) obstacles.push(new Paloma(xPos, groundY - 130, palomaFrames));
        else if (r < 0.45) obstacles.push(new Obstacle(xPos, groundY - 4,   ballaImg,   'balla'));
        else if (r < 0.65) obstacles.push(new Obstacle(xPos, groundY - 35,  barrera2Img,'barrera2'));
        else if (r < 0.85) obstacles.push(new Obstacle(xPos, groundY - 24,  barrelImg,  'barril'));
        else                obstacles.push(new Obstacle(xPos, groundY - 4,   autoImg,    'auto'));
        lastSpawnX = xPos;
    } else {
        if (Math.random() < 0.5) {
            items.push(new Item('bread', xPos, groundY - 140, breadImg));
            lastSpawnX = xPos;
        } else {
            for (let i = 0; i < 6; i++)
                items.push(new Item('gold', xPos + i * 75, (groundY + 20) - Math.sin((i / 5) * Math.PI) * 180, coinImg));
            lastSpawnX = xPos + 450;
        }
    }
}

// =====================================================
// COLISIÓN
// =====================================================
function checkCollision(p, obj, margin) {
    return (
        p.x + margin         < obj.x + obj.width  &&
        p.x + p.width - margin > obj.x             &&
        p.y + margin         < obj.y + obj.height  &&
        p.y + p.height - margin > obj.y
    );
}

// =====================================================
// GAME LOOP PRINCIPAL
// =====================================================
function gameLoop() {
    if (!window.gameActive) return;

    // Pedir siguiente frame AL PRINCIPIO para que cancelAnimationFrame funcione bien
    animationId = requestAnimationFrame(gameLoop);

    // Limpiar canvas — resetear filter explícitamente antes de cualquier draw
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Tiempo y velocidad
    const gameTime = (Date.now() - startTime) / 1000;
    if (gameTime >= 15) introActive = false;
    bgSpeed = gameTime < 15  ? BASE_SPEED
            : gameTime < 45  ? BASE_SPEED + 1.5
            : (BASE_SPEED + 3.5) + Math.sin(gameTime * 0.3) * 2;

    bgX -= bgSpeed;
    drawInfiniteBackground(bgX);

    const groundY    = groundYNow();
    const aliveHorde = window.horde.filter(p => !p.isDying);

    // Tsunami
    if (aliveHorde.length >= 15 && tsunamiTimer <= 0) tsunamiTimer = 300;
    if (tsunamiTimer > 0) tsunamiTimer--;

    // ---- GAME OVER ----
    // Condición: no hay nadie vivo Y la horda entera ya está vacía
    if (aliveHorde.length === 0 && window.horde.length === 0) {
        window.gameActive = false;
        cancelAnimationFrame(animationId);
        animationId = null;
        document.getElementById("game-over-screen").style.display = "flex";
        return;
    }

    // ---- ACTUALIZAR LÍDER ----
    if (aliveHorde.length > 0) {
        const leader = aliveHorde[0];
        leader.isLeader = true;

        // Piso sobre cajas
        let currentFloor = groundY;
        for (const b of boxes) {
            if (leader.x + leader.width > b.x + 20 && leader.x < b.x + b.width - 20) {
                if (leader.y + leader.height <= b.y + 35 && leader.velocityY >= 0) {
                    currentFloor   = b.y - leader.height;
                    leader.state   = "onBox";
                }
            }
        }
        leader.updateLeader(currentFloor);

        // Buffer de acciones para followers
        actionBuffer.push({ x: leader.x, y: leader.y, state: leader.state, frame: leader.frame, velocityY: leader.velocityY });
        if (actionBuffer.length > 500) actionBuffer.shift();

        for (let i = 1; i < aliveHorde.length; i++) {
            const data = actionBuffer[actionBuffer.length - 1 - i * DELAY_FRAMES] || actionBuffer[0];
            aliveHorde[i].isLeader = false;
            aliveHorde[i].updateFollower(data, i);
        }
    }

    // ---- LIMPIAR HORDA (muriendo / fuera de pantalla) ----
    for (let i = window.horde.length - 1; i >= 0; i--) {
        const p = window.horde[i];
        if (p.isDying) {
            p.updateLeader(groundY);
            if (p.deathTimer > 90 || p.x + p.width < -200) {
                window.horde.splice(i, 1);
                updateUI();
            }
        } else if (p.x < -80) {
            p.triggerDeath();
        }
    }

    // ---- SPAWN ----
    spawnTimer++;
    if (spawnTimer > 35) { spawnPattern(groundY); spawnTimer = 0; }
    lastSpawnX -= bgSpeed;

    // ---- CAJAS ----
    for (let i = boxes.length - 1; i >= 0; i--) {
        const b = boxes[i];
        b.update(bgSpeed);
        b.draw(ctx);

        let touching = false;
        for (const p of aliveHorde) {
            if (p.y + p.height > b.y + 10 &&
                p.x + p.width  > b.x + 5  &&
                p.x            < b.x + b.width - 15) {
                touching = true;
                p.x = b.x - p.width + 5;
                if (aliveHorde.length >= 3) b.isBeingPushed = true;
            }
        }

        if (touching && aliveHorde.length >= 3) {
            b.health -= 3.5;
            if (b.health <= 0) {
                explosions.push(new Explosion(b.x, b.y));
                explSound.cloneNode().play().catch(() => {});
                boxes.splice(i, 1);
                addToHorde(5, true);
                continue; // saltar al siguiente, la caja ya no existe
            }
        } else {
            b.isBeingPushed = false;
        }

        if (boxes[i] && boxes[i].x < -400) boxes.splice(i, 1);
    }

    // ---- OBSTÁCULOS ----
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.update(bgSpeed);
        obs.draw(ctx);

        let hit = false;
        for (const p of aliveHorde) {
            if (checkCollision(p, obs, obs instanceof Paloma ? 15 : 35)) {
                explosions.push(new Explosion(obs.x, obs.y));
                explSound.cloneNode().play().catch(() => {});
                obstacles.splice(i, 1);
                hit = true;
                if (tsunamiTimer <= 0) { p.triggerDeath(); updateUI(); }
                break;
            }
        }
        if (hit) continue;
        if (obstacles[i] && obstacles[i].x < -400) obstacles.splice(i, 1);
    }

    // ---- EXPLOSIONES ----
    ctx.filter = "none";
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].update(bgSpeed);
        explosions[i].draw(ctx);
        if (explosions[i].isFinished) explosions.splice(i, 1);
    }

    // ---- ITEMS ----
    ctx.filter = "none";
    for (let i = items.length - 1; i >= 0; i--) {
        items[i].update(bgSpeed);
        items[i].draw(ctx);
        let picked = false;
        for (const m of aliveHorde) {
            if (checkCollision(m, items[i], -15)) {
                picked = true;
                const t = items[i].type;
                if (t === 'gold') {
                    goldScore++;
                    document.getElementById("gold-count").innerText = goldScore;
                    const s = coinSound.cloneNode(); s.volume = 0.05; s.play().catch(() => {});
                } else if (t === 'bread') {
                    addToHorde(null, true);
                } else if (t === 'salchipapa') {
                    addToHorde(5, true);
                    addToHorde(7, true);
                }
                break;
            }
        }
        if (picked || items[i].x < -1200) items.splice(i, 1);
    }

    // ---- DIBUJAR HORDA ----
    // Resetear filter antes de dibujar personajes
    ctx.filter = "none";
    ctx.globalAlpha = 1;

    const sorted = [...window.horde].sort((a, b) =>
        (a.y + a.groupOffsetY) - (b.y + b.groupOffsetY)
    );
    for (const m of sorted) m.draw(ctx, tsunamiTimer > 0);

    // Garantizar que el filter quede limpio al final del frame
    ctx.filter = "none";
    ctx.globalAlpha = 1;
}

// =====================================================
// MENÚ ANIMADO
// =====================================================
let menuPlayer    = null;
let menuAnimId    = null;

function drawMenu() {
    if (window.gameActive) return;

    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    menuBgX -= 2.5;
    drawInfiniteBackground(menuBgX);

    if (!menuPlayer || menuPlayer.skinID !== selectedLeaderSkin) {
        menuPlayer = new Player(selectedLeaderSkin, true);
    }
    menuPlayer.x     = canvas.width / 2 - 48;
    menuPlayer.y     = groundYNow();
    menuPlayer.state = "run";
    menuPlayer.frame = Math.floor(Date.now() / 100) % 4;
    menuPlayer.draw(ctx, false);

    menuAnimId = requestAnimationFrame(drawMenu);
}

// =====================================================
// FULLSCREEN & BOTONES
// =====================================================
function tryEnterFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
}

document.getElementById("start-btn").addEventListener("click", () => {
    tryEnterFullscreen();
    // Detener el loop del menú antes de iniciar el juego
    if (menuAnimId !== null) { cancelAnimationFrame(menuAnimId); menuAnimId = null; }
    initGame();
});

document.getElementById("restart-btn").addEventListener("click", () => {
    tryEnterFullscreen();
    if (menuAnimId !== null) { cancelAnimationFrame(menuAnimId); menuAnimId = null; }
    initGame();
});

drawMenu();
