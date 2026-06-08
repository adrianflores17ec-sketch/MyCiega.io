// ─────────────────────────────────────────────
//  CACHÉ GLOBAL DE SPRITES
//  Una sola instancia de cada imagen, compartida
//  por todos los Player con esa skinID.
// ─────────────────────────────────────────────
const IMG_CACHE = {};

function loadCached(src) {
    if (!IMG_CACHE[src]) {
        const img = new Image();
        img.src = src;
        IMG_CACHE[src] = img;
    }
    return IMG_CACHE[src];
}

// Pre-carga todas las skins usadas en el juego
(function preload() {
    [1,2,3,4,5,7].forEach(id => {
        for (let i = 1; i <= 4; i++) loadCached(`assets/skin${id}/run${i}.png`);
        for (let i = 1; i <= 2; i++) loadCached(`assets/skin${id}/jump${i}.png`);
    });
    // explosiones
    for (let i = 4; i <= 5; i++) loadCached(`assets/explosion/expl${i}.png`);
    // palomas
    for (let i = 1; i <= 5; i++) loadCached(`assets/paloma/paloma${i}.png`);
})();

// ─────────────────────────────────────────────
//  CLASE PLAYER
// ─────────────────────────────────────────────
class Player {
    constructor(skinID, isLeader = false, startJumping = false) {
        this.skinID   = skinID;
        this.isLeader = isLeader;
        this.w = 96; this.h = 96;
        this.x = isLeader ? 150 : 0;
        this.y = 0;
        this.vy       = startJumping ? -14 : 0;
        this.gravity  = 0.91;
        this.jumpForce= -22;
        this.state    = 'run';
        this.jumpHeld = false;
        this.dying    = false;
        this.deathT   = 0;

        // posición en la horda
        this.dist     = isLeader ? 0 : 12 + Math.random() * 25;
        this.react    = 0.15;
        this.driftOff = Math.random() * 1000;
        this.offX     = isLeader ? 0 : Math.random() * 60 - 30;
        this.offY     = isLeader ? 0 : Math.random() * 14 - 7;

        this.frame    = 0;
        this.frameT   = 0;

        // Obtener sprites del caché
        this.run  = [];
        this.jump = [];
        for (let i = 1; i <= 4; i++) this.run.push(loadCached(`assets/skin${skinID}/run${i}.png`));
        for (let i = 1; i <= 2; i++) this.jump.push(loadCached(`assets/skin${skinID}/jump${i}.png`));
    }

    triggerDeath() {
        if (this.dying) return;
        this.dying    = true;
        this.vy       = -10;
        this.isLeader = false;
    }

    doJump() {
        if (!this.dying && (this.state === 'run' || this.state === 'onBox')) {
            this.vy    = this.jumpForce;
            this.state = 'jump';
        }
    }

    updateAsLeader(floor) {
        if (this.dying) {
            this.x -= 8; this.vy += this.gravity; this.y += this.vy; this.deathT++;
            return;
        }
        if (this.x < 150) this.x += 2.5;
        this.vy += this.gravity * (this.state === 'jump' && this.jumpHeld ? 1.0 : 2.5);
        if (this.state !== 'jump') this.vy = Math.min(this.vy, 18); // cap caída
        this.y += this.vy;
        if (this.y >= floor) { this.y = floor; this.vy = 0; this.state = 'run'; }
        if (++this.frameT > 6) { this.frame = (this.frame + 1) % 4; this.frameT = 0; }
    }

    updateAsFollower(data, idx) {
        if (this.dying) {
            this.x -= 8; this.vy += this.gravity; this.y += this.vy; this.deathT++;
            return;
        }
        if (!data) return;
        this.y    = data.y + this.offY;
        const tx  = data.x - idx * this.dist + this.offX + Math.sin((Date.now() + this.driftOff) * 0.003) * 12;
        this.x   += (tx - this.x) * this.react;
        this.state = data.state;
        this.frame = data.frame;
        this.vy    = data.vy;
    }

    draw(ctx, glowing) {
        // Elegir imagen según estado
        let img = this.state === 'jump'
            ? this.jump[this.vy < 0 ? 0 : 1]
            : this.run[this.frame % 4];

        // Fallback: cualquier frame de run cargado
        if (!img || !img.complete || !img.naturalWidth) {
            img = this.run.find(i => i && i.complete && i.naturalWidth) || null;
        }
        if (!img) return;

        ctx.save();
        if (this.dying) {
            // Efecto muerte: dibujar semitransparente en tono rojo
            // SIN usar ctx.filter (bug en móvil)
            ctx.globalAlpha = 0.45;
        } else if (glowing) {
            // Efecto tsunami: sombra dorada manual con múltiples draws
            ctx.globalAlpha = 0.35;
            // halo dorado
            ctx.drawImage(img, this.x - 3, this.y - 3, this.w + 6, this.h + 6);
            ctx.drawImage(img, this.x + 3, this.y - 3, this.w + 6, this.h + 6);
            ctx.globalAlpha = 1;
        }
        ctx.drawImage(img, this.x, this.y, this.w, this.h);
        ctx.restore();
    }

    // getters para compatibilidad con game.js
    get width()  { return this.w; }
    get height() { return this.h; }
    get isDying(){ return this.dying; }
    get velocityY() { return this.vy; }
    get deathTimer(){ return this.deathT; }
    get groupOffsetY() { return this.offY; }
}
