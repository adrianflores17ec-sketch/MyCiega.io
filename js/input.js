window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "w", " ", "ArrowDown", "s"].includes(e.key)) {
        window.leaderJump();
        let alive = window.horde.filter(p => !p.isDying);
        if (alive[0]) alive[0].isJumpHeld = true;
    }
});
window.addEventListener("keyup", (e) => {
    if (["ArrowUp", "w", " ", "ArrowDown", "s"].includes(e.key)) {
        window.horde.forEach(p => p.isJumpHeld = false);
    }
});
window.addEventListener("pointerdown", () => {
    window.leaderJump();
    let alive = window.horde.filter(p => !p.isDying);
    if (alive[0]) alive[0].isJumpHeld = true;
});
window.addEventListener("pointerup", () => {
    window.horde.forEach(p => p.isJumpHeld = false);
});
window.addEventListener("contextmenu", e => e.preventDefault());