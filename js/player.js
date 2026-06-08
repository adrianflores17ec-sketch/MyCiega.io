// --- CACHÉ GLOBAL DE SPRITES ---
// Evita recargar las mismas imágenes cada vez que se crea un Player nuevo.
// Todas las skins comparten las mismas instancias de Image ya cargadas.
const SPRITE_CACHE = {};

function getSkinSprites(skinID) {
    if (SPRITE_CACHE[skinID]) return SPRITE_CACHE[skinID];

    const f = `assets/skin${skinID}`;
    const sprites = { run: [], jump: [] };

    for (let i = 1; i <= 4; i++) {
        let img = new Image();
        img.src = `${f}/run${i}.png`;
        sprites.run.push(img);
    }
    for (let i = 1; i <= 2; i++) {
        let img = new Image();
        img.src = `${f}/jump${i}.png`;
        sprites.jump.push(img);
    }

    SPRITE_CACHE[skinID] = sprites;
    return sprites;
}

// Pre-cargar todas las skins al inicio para que estén listas antes de usarlas
(function preloadAllSkins() {
    [1, 2, 3, 4, 5, 7].forEach(id => getSkinSprites(id));
})();

class Player {
    constructor(skinID, isLeader = false, startJumping = false) {
        this.skinID = skinID;
        this.isLeader = isLeader;
        this.width = 96; this.height = 96; this.baseHeight = 96;
        this.x = isLeader ? 150 : 0;
        this.y = 0; this.velocityY = startJumping ? -14 : 0;
        this.gravity = 0.91; this.jumpForce = -22;
        this.state = "run";
        this.isJumpHeld = false; this.isDying = false; this.deathTimer = 0;
        this.personalDistance = isLeader ? 0 : (12 + Math.random() * 25);
        this.reactionSpeed = 0.15;
        this.driftOffset = Math.random() * 1000;
        this.groupOffsetX = isLeader ? 0 : (Math.random() * 60 - 30);
        this.groupOffsetY = isLeader ? 0 : (Math.random() * 14 - 7);
        this.frame = 0; this.frameCounter = 0;

        // Usar caché en lugar de crear nuevas imágenes cada vez
        this.sprites = getSkinSprites(skinID);
    }

    triggerDeath() { if (this.isDying) return; this.isDying = true; this.velocityY = -10; this.isLeader = false; }

    jump() { if (!this.isDying && (this.state === "run" || this.state === "onBox")) { this.velocityY = this.jumpForce; this.state = "jump"; } }

    updateLeader(groundY) {
        if (this.isDying) { this.x -= 8; this.velocityY += this.gravity; this.y += this.velocityY; this.deathTimer++; return; }
        if (this.x < 150) this.x += 2.5;
        if (this.state === "jump") {
            if (this.isJumpHeld && this.velocityY > -5) this.velocityY = 2.7;
            else { this.velocityY += this.gravity * (!this.isJumpHeld ? 2.5 : 1.0); }
        } else this.velocityY += this.gravity;
        this.y += this.velocityY;
        if (this.y >= groundY) { this.y = groundY; this.velocityY = 0; this.state = "run"; }
        this.frameCounter++; if (this.frameCounter > 6) { this.frame = (this.frame + 1) % 4; this.frameCounter = 0; }
    }

    updateFollower(data, index) {
        if (this.isDying) { this.x -= 8; this.velocityY += this.gravity; this.y += this.velocityY; this.deathTimer++; return; }
        if (!data) return;
        this.y = data.y + this.groupOffsetY;
        let targetX = data.x - (index * this.personalDistance) + this.groupOffsetX + Math.sin((Date.now() + this.driftOffset) * 0.003) * 12;
        this.x += (targetX - this.x) * this.reactionSpeed;
        this.state = data.state; this.frame = data.frame; this.velocityY = data.velocityY;
    }

    draw(ctx, inv) {
        // Seleccionar frame correcto según estado
        let img = (this.state === "jump")
            ? this.sprites.jump[this.velocityY < 0 ? 0 : 1]
            : this.sprites.run[this.frame % 4];

        // Fallback: si el frame actual no está listo, buscar cualquier imagen cargada
        if (!img || !img.complete) {
            img = this.sprites.run.find(i => i && i.complete) || null;
        }

        // Solo dibujar si tenemos imagen válida y cargada
        if (!img || !img.complete) return;

        ctx.save();
        if (this.isDying) {
            ctx.globalAlpha = 0.5;
            ctx.filter = "grayscale(1) brightness(2) sepia(1) saturate(5)";
        } else if (inv) {
            ctx.filter = "drop-shadow(0 0 8px gold) brightness(1.2)";
        }
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}
