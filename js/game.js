const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- LÓGICA DE SELECCIÓN Y FONDO ---
let selectedLeaderSkin = 1; 
let menuBgX = 0; 
window.gameActive = false; // Accesible globalmente para input.js

window.selectSkin = function(skinId, element) {
    selectedLeaderSkin = skinId;
    document.querySelectorAll('.skin-card').forEach(card => card.classList.remove('active'));
    element.classList.add('active');
    if (breadSound) breadSound.cloneNode().play().catch(()=>{});
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false; 
}
window.addEventListener("resize", resize);
resize();

function drawInfiniteBackground(offsetX) {
    if (!bg1.complete || !bg2.complete) return;

    let scale = canvas.height / bg1.naturalHeight;
    let bg1W = bg1.naturalWidth * scale;
    let bg2W = bg2.naturalWidth * scale;
    let totalW = bg1W + bg2W;

    let x = offsetX % totalW;
    if (x > 0) x -= totalW;

    while (x < canvas.width) {
        ctx.drawImage(bg1, x, 0, bg1W, canvas.height);
        x += bg1W;
        ctx.drawImage(bg2, x, 0, bg2W, canvas.height);
        x += bg2W;
    }
}

// --- CONSTANTES Y ASSETS ---
const LETRAS_COIN = {
    'T': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    'E': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,1,1,1]],
    'A': [[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    'M': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
    'O': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    'I': [[0,1,1,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
    'C': [[0,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,1]],
    'G': [[0,1,1,1,1],[1,0,0,0,0],[1,1,0,1,1],[1,0,0,0,1],[0,1,1,1,1]],
    'H': [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    'Q': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,1,0],[0,1,1,1,1]],
    'U': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    'N': [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1]],
    'X': [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
    'R': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,1]],
    'Ñ': [[1,1,1,0,0],[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1]],
    '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
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

let actionBuffer, explosions, items, obstacles, boxes;
let goldScore, nextSkinId, bgX, bgSpeed, spawnTimer, startTime, introActive, tsunamiTimer, lastSpawnX;
const GROUND_PERCENT = 0.92, BASE_SPEED = 5.5, DELAY_FRAMES = 8;
let animationId = null;

// --- FUNCIONES CORE ---

function initGame() {
    if (animationId) cancelAnimationFrame(animationId);
    
    window.horde = [new Player(selectedLeaderSkin, true)];
    
    if (selectedLeaderSkin <= 4) nextSkinId = (selectedLeaderSkin % 4) + 1;
    else nextSkinId = 1;

    actionBuffer = []; explosions = []; items = []; obstacles = []; boxes = [];
    goldScore = 0; bgX = 0; bgSpeed = BASE_SPEED;
    spawnTimer = 0; startTime = Date.now(); introActive = true; 
    window.gameActive = true; tsunamiTimer = 0; lastSpawnX = 0;
    
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("game-over-screen").style.display = "none";
    document.getElementById("ui").style.display = "flex";
    document.getElementById("gold-count").innerText = "0";
    
    updateUI();
    if (!musicStarted) setupMusic();
    setTimeout(() => { if(window.gameActive) spawnWord(FRASES[Math.floor(Math.random()*FRASES.length)], canvas.width + 100, (canvas.height * GROUND_PERCENT) - 96); }, 800);
    gameLoop();
}

function setupMusic() {
    if (currentBgMusic) { currentBgMusic.pause(); currentBgMusic.remove(); }
    currentBgMusic = new Audio(playlist[musicIndex]);
    currentBgMusic.volume = 0.7;
    currentBgMusic.onended = () => { musicIndex = (musicIndex + 1) % playlist.length; setupMusic(); currentBgMusic.play(); };
}

window.leaderJump = () => {
    if (!window.gameActive) return;
    let alive = window.horde.filter(p => !p.isDying);
    if (alive.length > 0) {
        alive[0].jump();
        if (!musicStarted && currentBgMusic) { currentBgMusic.play().then(() => musicStarted = true).catch(() => {}); }
    }
};

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
}

function addToHorde(skinId = null, jump = false) {
    if (window.horde.filter(p=>!p.isDying).length >= 30) return;
    const finalSkin = skinId || nextSkinId;
    window.horde.push(new Player(finalSkin, false, jump));
    if (skinId === null && nextSkinId <= 4) nextSkinId = (nextSkinId % 4) + 1;
    breadSound.cloneNode().play().catch(()=>{});
    updateUI();
}

function updateUI() {
    const count = window.horde.filter(p => !p.isDying).length;
    document.getElementById("lizeth-count").innerText = count;
}

function spawnPattern(groundY, gameTime) {
    if (introActive || !window.gameActive) return;
    if (canvas.width - lastSpawnX < 450) return;
    const chance = Math.random();
    if (chance < 0.015) { items.push(new Item('salchipapa', canvas.width + 100, groundY - 160, salchipapaImg)); lastSpawnX = canvas.width + 100; }
    else if (chance < 0.065) { boxes.push(new Box(canvas.width + 100, groundY - 4, boxImg)); lastSpawnX = canvas.width + 100; }
    else if (chance < 0.515) {
        const obsChance = Math.random(); let xPos = canvas.width + 100;
        if (obsChance < 0.25) obstacles.push(new Paloma(xPos, groundY - 130, palomaFrames));
        else if (obsChance < 0.45) obstacles.push(new Obstacle(xPos, groundY - 4, ballaImg, 'balla'));
        else if (obsChance < 0.65) obstacles.push(new Obstacle(xPos, groundY - 35, barrera2Img, 'barrera2'));
        else if (obsChance < 0.85) obstacles.push(new Obstacle(xPos, groundY - 24, barrelImg, 'barril'));
        else obstacles.push(new Obstacle(xPos, groundY - 4, autoImg, 'auto'));
        lastSpawnX = xPos;
    } else {
        const itemChance = Math.random(); let xPos = canvas.width + 100;
        if (itemChance < 0.50) { items.push(new Item('bread', xPos, groundY - 140, breadImg)); lastSpawnX = xPos; }
        else { for (let i = 0; i < 6; i++) items.push(new Item('gold', xPos + (i * 75), (groundY + 20) - Math.sin((i / 5) * Math.PI) * 180, coinImg)); lastSpawnX = xPos + 450; }
    }
}

function gameLoop() {
    if (!window.gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gameTime = (Date.now() - startTime) / 1000;
    bgSpeed = (gameTime < 15) ? BASE_SPEED : (gameTime < 45) ? BASE_SPEED + 1.5 : (BASE_SPEED + 3.5) + Math.sin(gameTime * 0.3) * 2;
    if (gameTime >= 15) introActive = false;

    bgX -= bgSpeed;
    drawInfiniteBackground(bgX);

    const groundY = (canvas.height * GROUND_PERCENT) - 96;
    let aliveHorde = window.horde.filter(p => !p.isDying);

    if (aliveHorde.length >= 15 && tsunamiTimer <= 0) tsunamiTimer = 300;
    if (tsunamiTimer > 0) tsunamiTimer--;
    
    if (aliveHorde.length === 0 && window.horde.length === 0) {
        window.gameActive = false; document.getElementById("game-over-screen").style.display = "flex"; return;
    }

    if (aliveHorde.length > 0) {
        const leader = aliveHorde[0]; leader.isLeader = true; let currentFloor = groundY;
        for(let b of boxes) { 
            if (leader.x + leader.width > b.x + 20 && leader.x < b.x + b.width - 20) { 
                if (leader.y + leader.height <= b.y + 35 && leader.velocityY >= 0) { 
                    currentFloor = b.y - leader.height; leader.state = "onBox"; 
                } 
            } 
        }
        leader.updateLeader(currentFloor);
        actionBuffer.push({x: leader.x, y: leader.y, state: leader.state, frame: leader.frame, velocityY: leader.velocityY});
        if (actionBuffer.length > 500) actionBuffer.shift();
        for (let i = 1; i < aliveHorde.length; i++) { 
            const data = actionBuffer[actionBuffer.length - 1 - (i * DELAY_FRAMES)] || actionBuffer[0]; 
            aliveHorde[i].isLeader = false; 
            aliveHorde[i].updateFollower(data, i); 
        }
    }

    for (let i = window.horde.length - 1; i >= 0; i--) { 
        let p = window.horde[i]; 
        if (p.isDying) { 
            p.updateLeader(groundY); 
            if (p.deathTimer > 100 || p.x + p.width < -100) window.horde.splice(i, 1); 
        } else if (p.x < -80) p.triggerDeath(); 
    }
    
    spawnTimer++; if (spawnTimer > 35) { spawnPattern(groundY, gameTime); spawnTimer = 0; }
    lastSpawnX -= bgSpeed;

    // --- CORRECCIÓN DE CAJAS ---
    for (let i = boxes.length - 1; i >= 0; i--) {
        let b = boxes[i]; b.update(bgSpeed); b.draw(ctx); 
        let hEmp = false;
        let boxDestroyed = false; // Variable de control
        
        for (let p of aliveHorde) { 
            if (p.y + p.height > b.y + 10 && p.x + p.width > b.x + 5 && p.x < b.x + b.width - 15) { 
                hEmp = true; 
                p.x = b.x - p.width + 5; 
                if (aliveHorde.length >= 3) b.isBeingPushed = true; 
            } 
        }
        
        if (hEmp && aliveHorde.length >= 3) { 
            b.health -= 3.5; 
            if (b.health <= 0) { 
                explosions.push(new Explosion(b.x, b.y)); 
                explSound.cloneNode().play().catch(()=>{}); 
                boxes.splice(i, 1); 
                boxDestroyed = true; // Marcamos que la caja se borró
                addToHorde(5, true); 
            } 
        } else b.isBeingPushed = false;
        
        // Solo verificamos salida de pantalla si NO fue borrada por colisión
        if (!boxDestroyed && b.x < -400) boxes.splice(i, 1);
    }
    
    // --- CORRECCIÓN DE OBSTÁCULOS ---
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update(bgSpeed); obstacles[i].draw(ctx);
        let obsDestroyed = false; // Variable de control
        
        for (let p of aliveHorde) { 
            if (checkCollision(p, obstacles[i], (obstacles[i] instanceof Paloma ? 15 : 35))) { 
                explosions.push(new Explosion(obstacles[i].x, obstacles[i].y)); 
                explSound.cloneNode().play().catch(()=>{}); 
                obstacles.splice(i, 1); 
                obsDestroyed = true; // Marcamos que el obstáculo se borró
                
                if (tsunamiTimer <= 0) { p.triggerDeath(); updateUI(); } 
                break; 
            } 
        }
        // Solo verificamos salida de pantalla si NO fue borrado
        if (!obsDestroyed && obstacles[i] && obstacles[i].x < -400) obstacles.splice(i, 1);
    }

    // Explosiones e Items
    for (let i = explosions.length - 1; i >= 0; i--) { 
        explosions[i].update(bgSpeed); explosions[i].draw(ctx); 
        if (explosions[i].isFinished) explosions.splice(i, 1); 
    }
    for (let i = items.length - 1; i >= 0; i--) {
        items[i].update(bgSpeed); items[i].draw(ctx); let hit = false;
        for (let m of aliveHorde) { 
            if (checkCollision(m, items[i], -15)) { 
                hit = true; 
                if (items[i].type === 'gold') { 
                    goldScore++; document.getElementById("gold-count").innerText = goldScore; 
                    let s = coinSound.cloneNode(); s.volume = 0.05; s.play().catch(()=>{}); 
                } else if (items[i].type === 'bread') addToHorde(null, true); 
                else if (items[i].type === 'salchipapa') { addToHorde(5, true); addToHorde(7, true); } 
                break; 
            } 
        }
        if (hit || items[i].x < -1200) items.splice(i, 1);
    }

    let sorted = [...window.horde].sort((a,b) => (a.y + a.groupOffsetY) - (b.y + b.groupOffsetY));
    for (let m of sorted) m.draw(ctx, tsunamiTimer > 0);

    animationId = requestAnimationFrame(gameLoop);
}

function checkCollision(p, obj, margin) { return (p.x + margin < obj.x + obj.width && p.x + p.width - margin > obj.x && p.y + margin < obj.y + obj.height && p.y + p.height - margin > obj.y); }

// --- MENÚ DINÁMICO ---
function drawMenu() {
    if (window.gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    menuBgX -= 2.5; 
    drawInfiniteBackground(menuBgX);

    const groundY = (canvas.height * GROUND_PERCENT) - 96;
    let p = new Player(selectedLeaderSkin, true);
    p.x = canvas.width / 2 - 48;
    p.y = groundY;
    p.frame = Math.floor(Date.now() / 100) % 4; 
    p.draw(ctx, false);

    requestAnimationFrame(drawMenu);
}

function tryEnterFullscreen() {
    let elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.log("Error intentando Fullscreen:", err));
    }
}

document.getElementById("start-btn").addEventListener("click", () => {
    tryEnterFullscreen();
    initGame();
});

document.getElementById("restart-btn").addEventListener("click", () => {
    tryEnterFullscreen();
    initGame();
});

drawMenu();
