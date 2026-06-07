window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "w", " ", "ArrowDown", "s"].includes(e.key)) {
        if (window.horde && window.horde.length > 0) window.leaderJump();
        let alive = window.horde.filter(p => !p.isDying);
        if (alive[0]) alive[0].isJumpHeld = true;
    }
});

window.addEventListener("keyup", (e) => {
    if (["ArrowUp", "w", " ", "ArrowDown", "s"].includes(e.key)) {
        if(window.horde) window.horde.forEach(p => p.isJumpHeld = false);
    }
});

// Corrección: Solo saltar si el juego está activo y no estamos tocando botones de la UI.
window.addEventListener("pointerdown", (e) => {
    if (!window.gameActive) return; // Evita el salto mientras estamos en el menú
    if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('.skin-card')) return;

    if (window.horde && window.horde.length > 0) {
        window.leaderJump();
        let alive = window.horde.filter(p => !p.isDying);
        if (alive[0]) alive[0].isJumpHeld = true;
    }
});

window.addEventListener("pointerup", () => {
    if(window.horde) window.horde.forEach(p => p.isJumpHeld = false);
});

window.addEventListener("contextmenu", e => e.preventDefault());
