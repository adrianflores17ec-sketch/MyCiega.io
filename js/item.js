// ── INPUT — teclado y táctil ─────────────────────────────
const JUMP_KEYS = new Set(['ArrowUp','w',' ','ArrowDown','s']);

window.addEventListener('keydown', e => {
    if (!JUMP_KEYS.has(e.key)) return;
    e.preventDefault();
    if (!window.gameActive || !window.horde) return;
    window.leaderJump();
    const alive = window.horde.filter(p => !p.dying);
    if (alive[0]) alive[0].jumpHeld = true;
});

window.addEventListener('keyup', e => {
    if (!JUMP_KEYS.has(e.key)) return;
    if (window.horde) window.horde.forEach(p => p.jumpHeld = false);
});

window.addEventListener('pointerdown', e => {
    if (!window.gameActive) return;
    if (e.target.tagName === 'BUTTON' || e.target.closest('.skin-card')) return;
    if (!window.horde) return;
    window.leaderJump();
    const alive = window.horde.filter(p => !p.dying);
    if (alive[0]) alive[0].jumpHeld = true;
});

window.addEventListener('pointerup', () => {
    if (window.horde) window.horde.forEach(p => p.jumpHeld = false);
});

window.addEventListener('contextmenu', e => e.preventDefault());
