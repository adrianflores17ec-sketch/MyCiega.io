class Item {
    constructor(type, x, y, img) {
        this.type = type; this.x = x; this.y = y;
        this.width = (type === 'salchipapa') ? 120 : 45;
        this.height = (type === 'salchipapa') ? 120 : 45;
        this.img = img;
    }
    update(speed) { this.x -= speed; }
    draw(ctx) { if (this.img.complete) ctx.drawImage(this.img, this.x, this.y, this.width, this.height); }
}
class Obstacle {
    constructor(x, y, img, type) {
        this.x = x; this.y = y; this.type = type;
        if (type === 'auto') { this.width = 150; this.height = 100; }
        else if (type === 'balla') { this.width = 110; this.height = 110; }
        else if (type === 'barrera2') { this.width = 120; this.height = 130; }
        else { this.width = 85; this.height = 120; }
        this.img = img;
    }
    update(speed) { this.x -= speed; }
    draw(ctx) { if (this.img.complete) ctx.drawImage(this.img, this.x, this.y, this.width, this.height); }
}
class Paloma {
    constructor(x, y, frames) { this.x = x; this.y = y; this.width = 80; this.height = 70; this.frames = frames; this.currentFrame = 0; this.counter = 0; }
    update(speed) { this.x -= speed + 2; if (++this.counter > 6) { this.currentFrame = (this.currentFrame + 1) % 5; this.counter = 0; } }
    draw(ctx) { let img = this.frames[this.currentFrame]; if (img && img.complete) ctx.drawImage(img, this.x, this.y, this.width, this.height); }
}
class Box {
    constructor(x, y, img) { this.x = x; this.y = y; this.width = 100; this.height = 100; this.img = img; this.health = 30; this.isBeingPushed = false; this.shakeX = 0; }
    update(speed) { if (this.isBeingPushed) { this.x -= speed * 0.3; this.shakeX = (Math.random()-0.5)*6; } else { this.x -= speed; this.shakeX = 0; } }
    draw(ctx) { if (this.img.complete) { ctx.drawImage(this.img, this.x + this.shakeX, this.y, this.width, this.height); ctx.fillStyle = "white"; ctx.font = "bold 24px Arial"; ctx.textAlign = "center"; ctx.fillText("3", this.x + this.width/2 + this.shakeX, this.y + 40); } }
}
class Explosion {
    constructor(x, y) {
        this.x = x; this.y = y; this.width = 130; this.height = 130; this.frame = 0; this.frameCounter = 0; this.isFinished = false;
        this.sprites = [new Image(), new Image()]; this.sprites[0].src = "assets/explosion/expl4.png"; this.sprites[1].src = "assets/explosion/expl5.png";
    }
    update(speed) { this.x -= speed; if (++this.frameCounter > 5) { this.frame++; this.frameCounter = 0; } if (this.frame >= 2) this.isFinished = true; }
    draw(ctx) { let img = this.sprites[this.frame]; if (img && img.complete) ctx.drawImage(img, this.x - 20, this.y - 20, this.width, this.height); }
}