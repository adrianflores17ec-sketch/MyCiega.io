// ─────────────────────────────────────────────
//  ITEMS, OBSTÁCULOS, EXPLOSIONES
// ─────────────────────────────────────────────

class Item {
    constructor(type, x, y, img) {
        this.type = type; this.x = x; this.y = y; this.img = img;
        this.w = type === 'salchipapa' ? 100 : 45;
        this.h = type === 'salchipapa' ? 100 : 45;
    }
    get width()  { return this.w; }
    get height() { return this.h; }
    update(spd)  { this.x -= spd; }
    draw(ctx)    { if (this.img && this.img.complete && this.img.naturalWidth) ctx.drawImage(this.img, this.x, this.y, this.w, this.h); }
}

class Obstacle {
    constructor(x, y, img, type) {
        this.x = x; this.y = y; this.img = img; this.type = type;
        const sizes = { auto:[150,100], balla:[95,95], barrera2:[110,130] };
        [this.w, this.h] = sizes[type] || [80, 120];
    }
    get width()  { return this.w; }
    get height() { return this.h; }
    update(spd)  { this.x -= spd; }
    draw(ctx)    { if (this.img && this.img.complete && this.img.naturalWidth) ctx.drawImage(this.img, this.x, this.y, this.w, this.h); }
}

class Paloma {
    constructor(x, y) {
        this.x = x; this.y = y; this.w = 80; this.h = 70;
        this.cf = 0; this.ct = 0;
        this.frames = [];
        for (let i = 1; i <= 5; i++) this.frames.push(loadCached(`assets/paloma/paloma${i}.png`));
    }
    get width()  { return this.w; }
    get height() { return this.h; }
    update(spd)  {
        this.x -= spd + 2;
        if (++this.ct > 6) { this.cf = (this.cf + 1) % 5; this.ct = 0; }
    }
    draw(ctx) {
        const img = this.frames[this.cf];
        if (img && img.complete && img.naturalWidth) ctx.drawImage(img, this.x, this.y, this.w, this.h);
    }
}

class Box {
    constructor(x, y, img) {
        this.x = x; this.y = y; this.img = img;
        this.w = 100; this.h = 100;
        this.hp = 45; this.pushed = false; this.shakeX = 0;
    }
    get width()  { return this.w; }
    get height() { return this.h; }
    update(spd) {
        if (this.pushed) { this.x -= spd * 0.3; this.shakeX = (Math.random() - 0.5) * 6; }
        else             { this.x -= spd;        this.shakeX = 0; }
    }
    draw(ctx) {
        if (!this.img || !this.img.complete || !this.img.naturalWidth) return;
        const dx = this.x + this.shakeX;
        ctx.drawImage(this.img, dx, this.y, this.w, this.h);
        // barra de vida
        const pct = this.hp / 45;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(dx + 5, this.y - 14, this.w - 10, 8);
        ctx.fillStyle = pct > 0.5 ? '#4cff4c' : '#ff4c4c';
        ctx.fillRect(dx + 5, this.y - 14, (this.w - 10) * pct, 8);
    }
}

class Explosion {
    constructor(x, y) {
        this.x = x; this.y = y; this.w = 130; this.h = 130;
        this.frame = 0; this.ft = 0; this.done = false;
        this.imgs = [loadCached('assets/explosion/expl4.png'), loadCached('assets/explosion/expl5.png')];
    }
    get isFinished() { return this.done; }
    update(spd) {
        this.x -= spd;
        if (++this.ft > 5) { this.frame++; this.ft = 0; }
        if (this.frame >= 2) this.done = true;
    }
    draw(ctx) {
        const img = this.imgs[this.frame];
        if (img && img.complete && img.naturalWidth) ctx.drawImage(img, this.x - 20, this.y - 20, this.w, this.h);
    }
}
