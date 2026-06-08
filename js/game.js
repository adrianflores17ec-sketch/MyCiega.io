const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const LETRAS_COIN = {
    'T': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    'E': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,1,1,1]],
    'A': [[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    'M': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
    'O': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    'I': [[0,1,1,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
    'C': [[0,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,1]],
    'G': [[0,1,1,1,1],[1,0,0,0,0],[1,1,1,1,1],[1,0,0,0,1],[0,1,1,1,1]],
    'H': [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    'Q': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,1,0],[0,1,1,1,1]],
    'U': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    'N': [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1]],
    'X': [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
    'R': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,1]],
    'Ñ': [[1,1,1,0,0],[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1]],
    '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
    'J': [[0,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0]],
    ':': [[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0]],
    ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
};
const FRASES = ["TE EXTRAÑO", "TE AMO", "MI CIEGA", "MI CHIQUITA", "MI ENOJONA", "11:11"];
const playlist = ["assets/musica2.mp3", "assets/musica1.mp3", "assets/musica3.mp3", "assets/musica4.mp3"];

let musicIndex = 0, currentBgMusic = null, musicStarted = false;
const coinSound = new Audio("assets/moneda.mp3");
const breadSound = new Audio("assets/pan.mp3");
const explSound = new Audio("assets/explosion.mp3");

const bg1 = new Image(); bg1.src = "assets/background.png";
const bg2 = new Image(); bg2.src = "assets/background2.png";
const coinImg = new Image(); coinImg.src = "assets/monedas.png";
const breadImg = new Image(); breadImg.src = "assets/pan.png";
const barrelImg = new Image(); barrelImg.src = "assets/barril.png";
const ballaImg = new Image(); ballaImg.src = "assets/balla.png";
const autoImg = new Image(); autoImg.src = "assets/auto.png";
const barrera2Img = new Image(); barrera2Img.src = "assets/barrera2.png";
const boxImg = new Image(); boxImg.src = "assets/caja.png";
const salchipapaImg = new Image(); salchipapaImg.src = "assets/salchipapa.png";

const palomaFrames = [];
for(let i=1; i<=5; i++) { let img = new Image(); img.src = `assets/paloma/paloma${i}.png`; palomaFrames.push(img); }

const SKINS_INFO = [{id:1,n:"LIZETH 1"},{id:2,n:"LIZETH 2"},{id:3,n:"LIZETH 3"},{id:4,n:"LIZETH 4"},{id:5,n:"MAIRA"},{id:7,n:"COME RATAS"}];
let skinIdx = 0, selectedSkinId = 1;

let actionBuffer, explosions, items, obstacles, boxes;
let goldScore, nextSkinId, bgX, bgSpeed, spawnTimer, startTime, introActive, gameActive, lastSpawnX;
const GROUND_PERCENT = 0.92, BASE_SPEED = 5.5, DELAY_FRAMES = 2;
let animationId = null;

function initGame() {
    if (animationId) cancelAnimationFrame(animationId);
    // QUITAR BLUR DEFINITIVAMENTE
    canvas.className = ""; 
    
    gameActive = true;
    window.horde = [new Player(selectedSkinId, true)];
    actionBuffer = []; explosions = []; items = []; obstacles = []; boxes = [];
    goldScore = 0; nextSkinId = 1; bgX = 0; bgSpeed = BASE_SPEED;
    spawnTimer = 0; startTime = Date.now(); introActive = true; lastSpawnX = 0;
    
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("game-over-screen").style.display = "none";
    document.getElementById("ui").style.display = "flex";
    document.getElementById("gold-count").innerText = "0";
    updateUI();
    if (!musicStarted) setupMusic();
    spawnWord(FRASES[Math.floor(Math.random()*FRASES.length)], canvas.width + 100, (canvas.height * GROUND_PERCENT) - 96);
    gameLoop();
}

function setupMusic() {
    if (currentBgMusic) currentBgMusic.pause();
    currentBgMusic = new Audio(playlist[musicIndex]);
    currentBgMusic.volume = 0.7;
    currentBgMusic.onended = () => { musicIndex = (musicIndex + 1) % playlist.length; setupMusic(); currentBgMusic.play(); };
}

window.leaderJump = () => {
    if (!gameActive) return;
    let alive = window.horde.filter(p => !p.isDying);
    if (alive.length > 0) {
        alive[0].jump();
        if (!musicStarted && currentBgMusic) { currentBgMusic.play().then(() => musicStarted = true).catch(() => {}); }
    }
};

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; ctx.imageSmoothingEnabled = false; }
window.addEventListener("resize", resize); resize();

function spawnWord(frase, startX, groundY) {
    const coinSp = 25, letSp = 45;
    let curX = startX;
    for (let char of frase.toUpperCase()) {
        const matrix = LETRAS_COIN[char] || LETRAS_COIN[' '];
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] === 1) items.push(new Item('gold', curX + (c * coinSp), (groundY - 250) + (r * coinSp), coinImg));
            }
        }
        curX += (5 * coinSp) + letSp;
    }
    lastSpawnX = curX + 300;
}

function addToHorde(skinId = null, jump = false) {
    if (window.horde.filter(p=>!p.isDying).length >= 100) return;
    window.horde.push(new Player(skinId || nextSkinId, false, jump));
    if (!skinId) nextSkinId = (nextSkinId >= 4) ? 1 : nextSkinId + 1;
    breadSound.cloneNode().play().catch(()=>{});
    updateUI();
}

function updateUI() {
    const count = window.horde.filter(p => !p.isDying).length;
    document.getElementById("lizeth-count").innerText = count;
}

function spawnPattern(groundY, gameTime) {
    if (introActive || !gameActive || canvas.width - lastSpawnX < 450) return;
    const aliveCount = window.horde.filter(p => !p.isDying).length;
    const isKillMode = aliveCount > 14; 
    const chance = Math.random();
    let xPos = canvas.width + 100;
    if (!isKillMode && chance < 0.015) { items.push(new Item('salchipapa', xPos, groundY - 160, salchipapaImg)); lastSpawnX = xPos + 200; }
    else if (chance < (isKillMode ? 0.85 : 0.45)) {
        const obsC = Math.random();
        if (obsC < 0.2) obstacles.push(new Paloma(xPos, groundY - 130, palomaFrames));
        else if (obsC < 0.4) obstacles.push(new Obstacle(xPos, groundY - 4, ballaImg, 'balla'));
        else if (obsC < 0.6) obstacles.push(new Obstacle(xPos, groundY - 35, barrera2Img, 'barrera2'));
        else if (obsC < 0.8) obstacles.push(new Obstacle(xPos, groundY - 24, barrelImg, 'barril'));
        else obstacles.push(new Obstacle(xPos, groundY - 4, autoImg, 'auto'));
        lastSpawnX = xPos + (isKillMode ? 300 : 450);
    } else {
        const itC = Math.random();
        if (itC < (isKillMode ? 0.10 : 0.50)) { items.push(new Item('bread', xPos, groundY - 140, breadImg)); lastSpawnX = xPos + 200; }
        else { for (let i = 0; i < 6; i++) items.push(new Item('gold', xPos + (i * 75), (groundY + 20) - Math.sin((i / 5) * Math.PI) * 180, coinImg)); lastSpawnX = xPos + 550; }
    }
}

function gameLoop() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let aliveHorde = window.horde.filter(p => !p.isDying);
    if (aliveHorde.length === 0 && window.horde.length === 0) {
        gameActive = false; document.getElementById("game-over-screen").style.display = "flex"; return;
    }
    const gameTime = (Date.now() - startTime) / 1000;
    bgSpeed = gameTime < 15 ? BASE_SPEED : (BASE_SPEED + 3.0) + Math.sin(gameTime * 0.3) * 1.5;
    if (aliveHorde.length > 14) bgSpeed += 4.5;
    if (gameTime >= 15) introActive = false;

    if (bg1.complete && bg2.complete) {
        let sc = canvas.height / bg1.naturalHeight, bg1W = bg1.naturalWidth * sc, bg2W = bg2.naturalWidth * sc;
        bgX = (bgX - bgSpeed) % (bg1W + bg2W);
        let curX = bgX; while (curX < canvas.width) { ctx.drawImage(bg1, curX, 0, bg1W, canvas.height); curX += bg1W; ctx.drawImage(bg2, curX, 0, bg2W, canvas.height); curX += bg2W; }
        const gY = (canvas.height * GROUND_PERCENT) - 96;
        if (aliveHorde.length > 0) {
            const lead = aliveHorde[0]; lead.isLeader = true; let curF = gY;
            for(let b of boxes) { if (lead.x + lead.width > b.x + 20 && lead.x < b.x + b.width - 20) { if (lead.y + lead.height <= b.y + 35 && lead.velocityY >= 0) { curF = b.y - lead.height; lead.state = "onBox"; } } }
            lead.updateLeader(curF);
            actionBuffer.push({x: lead.x, y: lead.y, state: lead.state, frame: lead.frame, velocityY: lead.velocityY});
            if (actionBuffer.length > 1000) actionBuffer.shift();
            for (let i = 1; i < aliveHorde.length; i++) { const data = actionBuffer[actionBuffer.length - 1 - (i * DELAY_FRAMES)] || actionBuffer[0]; aliveHorde[i].isLeader = false; aliveHorde[i].updateFollower(data, i); }
        }
        for (let i = window.horde.length - 1; i >= 0; i--) { let p = window.horde[i]; if (p.isDying) { p.updateLeader(gY); if (p.deathTimer > 100 || p.x < -100) window.horde.splice(i, 1); } else if (p.x < -80) p.triggerDeath(); }
        if (spawnTimer++ > (aliveHorde.length > 14 ? 20 : 35)) { spawnPattern(gY, gameTime); spawnTimer = 0; }
        lastSpawnX -= bgSpeed;
        for (let i = boxes.length - 1; i >= 0; i--) {
            let b = boxes[i]; b.update(bgSpeed); b.draw(ctx); let hEmp = false;
            for (let p of aliveHorde) { if (p.y + p.height > b.y + 10 && p.x + p.width > b.x + 5 && p.x < b.x + b.width - 15) { hEmp = true; p.x = b.x - p.width + 5; if (aliveHorde.length >= 3) b.isBeingPushed = true; } }
            if (hEmp && aliveHorde.length >= 3) { b.health -= 3.5; if (b.health <= 0) { explosions.push(new Explosion(b.x, b.y)); explSound.cloneNode().play().catch(()=>{}); boxes.splice(i, 1); addToHorde(5, true); } } else b.isBeingPushed = false;
            if (b.x < -400) boxes.splice(i, 1);
        }
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update(bgSpeed); obstacles[i].draw(ctx);
            for (let p of aliveHorde) { if (checkCollision(p, obstacles[i], (obstacles[i] instanceof Paloma ? 15 : 35))) { explosions.push(new Explosion(obstacles[i].x, obstacles[i].y)); explSound.cloneNode().play().catch(()=>{}); obstacles.splice(i, 1); p.triggerDeath(); updateUI(); break; } }
            if (obstacles[i] && obstacles[i].x < -400) obstacles.splice(i, 1);
        }
        for (let i = explosions.length - 1; i >= 0; i--) { explosions[i].update(bgSpeed); explosions[i].draw(ctx); if (explosions[i].isFinished) explosions.splice(i, 1); }
        for (let i = items.length - 1; i >= 0; i--) {
            items[i].update(bgSpeed); items[i].draw(ctx); let hit = false;
            for (let m of aliveHorde) { if (checkCollision(m, items[i], -15)) { hit = true; if (items[i].type === 'gold') { goldScore++; document.getElementById("gold-count").innerText = goldScore; let s = coinSound.cloneNode(); s.volume = 0.05; s.play().catch(()=>{}); } else if (items[i].type === 'bread') addToHorde(null, true); else if (items[i].type === 'salchipapa') { addToHorde(5, true); addToHorde(7, true); } break; } }
            if (hit || items[i].x < -1200) items.splice(i, 1);
        }
        let sorted = [...window.horde].sort((a,b) => (a.y + a.groupOffsetY) - (b.y + b.groupOffsetY));
        for (let m of sorted) m.draw(ctx);
    }
    animationId = requestAnimationFrame(gameLoop);
}

function checkCollision(p, obj, m) { return (p.x + m < obj.x + obj.width && p.x + p.width - m > obj.x && p.y + m < obj.y + obj.height && p.y + p.height - m > obj.y); }

function drawMenu() {
    if(gameActive) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    canvas.className = "menu-blur";
    if(bg1.complete) {
        let sc = canvas.height/bg1.naturalHeight;
        bgX = (bgX - 0.5) % (bg1.naturalWidth * sc);
        ctx.drawImage(bg1, bgX, 0, bg1.naturalWidth*sc, canvas.height);
        ctx.drawImage(bg1, bgX + bg1.naturalWidth*sc, 0, bg1.naturalWidth*sc, canvas.height);
    }
    requestAnimationFrame(drawMenu);
}

function updatePreview() {
    const skin = SKINS_INFO[skinIdx];
    document.getElementById("skin-img-preview").src = `assets/skin${skin.id}/idle1.png`;
    document.getElementById("skin-name").innerText = skin.n;
    selectedSkinId = skin.id;
}

document.getElementById("prev-skin").onclick = () => { skinIdx = (skinIdx-1+SKINS_INFO.length)%SKINS_INFO.length; updatePreview(); coinSound.cloneNode().play(); };
document.getElementById("next-skin").onclick = () => { skinIdx = (skinIdx+1)%SKINS_INFO.length; updatePreview(); coinSound.cloneNode().play(); };
document.getElementById("start-btn").onclick = () => initGame();
document.getElementById("restart-btn").onclick = () => initGame();

gameActive = false;
drawMenu();