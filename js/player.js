const SPRITE_CACHE = {};
class Player {
    constructor(skinID, isLeader = false, startJumping = false) {
        this.skinID = skinID; this.isLeader = isLeader;
        this.width = 96; this.height = 96; this.x = isLeader ? 150 : 0; this.y = 0;
        this.velocityY = startJumping ? -14 : 0;
        this.gravity = 0.91; this.jumpForce = -22;
        this.state = "run"; this.isJumpHeld = false; this.isDying = false; this.deathTimer = 0;
        this.personalDistance = 18; this.reactionSpeed = 0.35;
        this.groupOffsetX = isLeader ? 0 : (Math.random() * 50 - 25);
        this.groupOffsetY = isLeader ? 0 : (Math.random() * 10 - 5);
        this.frame = 0; this.frameCounter = 0;
        this.loadSprites();
    }
    loadSprites() {
        const path = `assets/skin${this.skinID}`;
        if (!SPRITE_CACHE[this.skinID]) {
            SPRITE_CACHE[this.skinID] = { run: [], jump: [] };
            for (let i = 1; i <= 4; i++) { let img = new Image(); img.src = `${path}/run${i}.png`; SPRITE_CACHE[this.skinID].run.push(img); }
            for (let i = 1; i <= 2; i++) { let img = new Image(); img.src = `${path}/jump${i}.png`; SPRITE_CACHE[this.skinID].jump.push(img); }
        }
        this.mySprites = SPRITE_CACHE[this.skinID];
    }
    triggerDeath() { if (this.isDying) return; this.isDying = true; this.velocityY = -10; this.isLeader = false; }
    jump() { if (!this.isDying && (this.state === "run" || this.state === "onBox")) { this.velocityY = this.jumpForce; this.state = "jump"; } }
    updateLeader(groundY) {
        if (this.isDying) { this.x -= 8; this.velocityY += this.gravity; this.y += this.velocityY; this.deathTimer++; return; }
        if (this.x < 150) this.x += 3;
        if (this.state === "jump") {
            if (this.isJumpHeld && this.velocityY > -5) this.velocityY = 2.7;
            else this.velocityY += this.gravity * (!this.isJumpHeld ? 2.5 : 1.0);
        } else this.velocityY += this.gravity;
        this.y += this.velocityY;
        if (this.y >= groundY) { this.y = groundY; this.velocityY = 0; this.state = "run"; }
        if (++this.frameCounter > 6) { this.frame = (this.frame + 1) % 4; this.frameCounter = 0; }
    }
    updateFollower(data, index) {
        if (this.isDying) { this.x -= 8; this.velocityY += this.gravity; this.y += this.velocityY; this.deathTimer++; return; }
        if (!data) return;
        this.y = data.y + this.groupOffsetY;
        let targetX = data.x - (index * this.personalDistance) + this.groupOffsetX;
        this.x += (targetX - this.x) * this.reactionSpeed;
        this.state = data.state; this.frame = data.frame; this.velocityY = data.velocityY;
    }
    draw(ctx) {
        let img = (this.state === "jump") ? this.mySprites.jump[this.velocityY < 0 ? 0 : 1] : this.mySprites.run[this.frame % 4];
        if (!img || !img.complete) return;
        if (this.isDying) { ctx.save(); ctx.globalAlpha = 0.5; ctx.drawImage(img, this.x, this.y, this.width, this.height); ctx.restore(); }
        else ctx.drawImage(img, this.x, this.y, this.width, this.height);
    }
}