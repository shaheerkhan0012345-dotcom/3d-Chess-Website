// ─── SCROLL SOURCE ───
const getScrollY = () => window.scrollY ?? window.pageYOffset ?? document.documentElement.scrollTop;

// ─── UTILS ───
function resizeCanvas(canvas, ctx) {
    const dpr = devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawCover(ctx, img, canvasW, canvasH) {
    const dpr = devicePixelRatio || 1;
    const cw = canvasW / dpr, ch = canvasH / dpr;
    const iw = img.naturalWidth  || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale, nh = ih * scale;
    ctx.drawImage(img, (cw - nw) / 2, (ch - nh) / 2, nw, nh);
}

// Returns the nearest loaded frame to targetIndex, searching outward up to `radius` slots
function getNearestLoaded(frames, targetIndex, radius) {
    const f0 = frames[targetIndex];
    if (f0 && f0.complete && f0.naturalWidth) return f0;
    for (let d = 1; d <= radius; d++) {
        const lo = targetIndex - d, hi = targetIndex + d;
        if (lo >= 0) { const f = frames[lo]; if (f && f.complete && f.naturalWidth) return f; }
        if (hi < frames.length) { const f = frames[hi]; if (f && f.complete && f.naturalWidth) return f; }
    }
    return null;
}

// Sparse / pyramid loader — fills frames in phases so early phases are visible almost instantly
// phases: array of step sizes, e.g. [40, 10, 2, 1]
function loadSparse(frames, pathFn, phases, onFirstPhaseReady) {
    let phaseIdx = 0;

    function runPhase() {
        if (phaseIdx >= phases.length) return;
        const step = phases[phaseIdx++];
        let pending = 0;

        for (let i = 0; i < frames.length; i += step) {
            if (frames[i] && frames[i].complete && frames[i].naturalWidth) continue;
            pending++;
            const img = new Image();
            const idx = i;
            img.onload = img.onerror = () => {
                pending--;
                if (pending === 0) {
                    if (phaseIdx === 1 && onFirstPhaseReady) onFirstPhaseReady();
                    setTimeout(runPhase, 120); // pause before next phase so browser stays responsive
                }
            };
            img.src = pathFn(i);
            frames[i] = img;
        }

        if (pending === 0) {
            if (phaseIdx === 1 && onFirstPhaseReady) onFirstPhaseReady();
            setTimeout(runPhase, 120);
        }
    }

    runPhase();
}

// Simple sequential chunk loader (used for small frame sets)
function loadInChunks(frames, pathFn, start, chunkSize, delayMs) {
    if (start >= frames.length) return;
    const end = Math.min(start + chunkSize, frames.length);
    for (let i = start; i < end; i++) {
        if (frames[i] && frames[i].complete && frames[i].naturalWidth) continue;
        const img = new Image();
        img.src = pathFn(i);
        frames[i] = img;
    }
    setTimeout(() => loadInChunks(frames, pathFn, end, chunkSize, delayMs), delayMs);
}

// ─── HERO SECTION (82 frames) ───
const heroFrameCount = 82;
const heroFramePath  = i => `chess photos/Chess_pieces_descending_onto_board_202606210034_${String(i).padStart(3,'0')}.png`;

const heroFrames  = new Array(heroFrameCount);
const heroCanvas  = document.getElementById('hero-canvas');
const heroCtx     = heroCanvas.getContext('2d', { alpha: false });
const heroSection = document.getElementById('hero');
let currentHeroFrame = -1;

resizeCanvas(heroCanvas, heroCtx);

const h0 = new Image();
h0.onload = () => {
    heroFrames[0] = h0;
    drawCover(heroCtx, h0, heroCanvas.width, heroCanvas.height);
    currentHeroFrame = 0;
    loadInChunks(heroFrames, heroFramePath, 1, 20, 30);
};
h0.onerror = () => loadInChunks(heroFrames, heroFramePath, 1, 20, 30);
h0.src = heroFramePath(0);
heroFrames[0] = h0;

// ─── THIRD SECTION (86 frames — load immediately alongside hero) ───
const thirdFrameCount = 86;
const thirdFramePath  = i => `third/ezgif-frame-${String(i + 1).padStart(3,'0')}.png`;

const thirdFrames  = new Array(thirdFrameCount);
const thirdCanvas  = document.getElementById('third-canvas');
const thirdCtx     = thirdCanvas.getContext('2d', { alpha: false });
const thirdSection = document.getElementById('third');
let currentThirdFrame = -1;

resizeCanvas(thirdCanvas, thirdCtx);

const t0 = new Image();
t0.onload = () => {
    thirdFrames[0] = t0;
    drawCover(thirdCtx, t0, thirdCanvas.width, thirdCanvas.height);
    currentThirdFrame = 0;
    loadInChunks(thirdFrames, thirdFramePath, 1, 20, 40);
};
t0.onerror = () => loadInChunks(thirdFrames, thirdFramePath, 1, 20, 40);
t0.src = thirdFramePath(0);
thirdFrames[0] = t0;

// ─── SECOND SECTION (1160 frames — sparse pyramid loading) ───
const secondFrameCount = 1160;
const secondFramePath  = i => `oops/${String(i + 1).padStart(5,'0')}.png`;

const secondFrames  = new Array(secondFrameCount);
const secondCanvas  = document.getElementById('second-canvas');
const secondCtx     = secondCanvas.getContext('2d', { alpha: false });
const secondSection = document.getElementById('second');
let currentSecondFrame = -1;
let secondInitialized  = false;

function initSecond() {
    if (secondInitialized) return;
    secondInitialized = true;
    resizeCanvas(secondCanvas, secondCtx);

    // Load frame 0 first so something shows immediately
    const s0 = new Image();
    s0.onload = () => {
        secondFrames[0] = s0;
        drawCover(secondCtx, s0, secondCanvas.width, secondCanvas.height);
        currentSecondFrame = 0;

        // Pyramid: phase 1=every 40th (29 imgs), phase 2=every 10th, phase 3=every 2nd, phase 4=all
        loadSparse(secondFrames, secondFramePath, [40, 10, 2, 1], null);
    };
    s0.onerror = () => loadSparse(secondFrames, secondFramePath, [40, 10, 2, 1], null);
    s0.src = secondFramePath(0);
    secondFrames[0] = s0;
}

// Start loading second section when user is near end of hero (80% through)
// Also observe in case they jump directly
const secondObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { secondObserver.disconnect(); initSecond(); }
}, { rootMargin: '500% 0px' }); // fire very early
secondObserver.observe(secondSection);

// ─── SCROLL HANDLER ───
let ticking = false;

function onScroll() {
    const scrollY = getScrollY();
    const vh = window.innerHeight;

    // ── Hero ──
    if (heroSection) {
        const heroMax      = heroSection.offsetHeight - vh;
        const heroFraction = Math.max(0, Math.min(1, scrollY / heroMax));
        const heroIndex    = Math.min(heroFrameCount - 1, Math.floor(heroFraction * heroFrameCount));

        if (heroIndex !== currentHeroFrame) {
            const f = getNearestLoaded(heroFrames, heroIndex, 15);
            if (f) { currentHeroFrame = heroIndex; drawCover(heroCtx, f, heroCanvas.width, heroCanvas.height); }
        }

        // Trigger second section loading once 80% through hero
        if (heroFraction > 0.8) initSecond();
    }

    // ── Second ──
    if (secondSection && secondInitialized) {
        const secondTop      = secondSection.offsetTop;
        const secondMax      = secondSection.offsetHeight - vh;
        const secondFraction = Math.max(0, Math.min(1, (scrollY - secondTop) / secondMax));
        const secondIndex    = Math.min(secondFrameCount - 1, Math.floor(secondFraction * secondFrameCount));

        if (secondIndex !== currentSecondFrame) {
            // Use nearest-frame fallback so canvas never goes blank while loading
            const f = getNearestLoaded(secondFrames, secondIndex, 50);
            if (f) { currentSecondFrame = secondIndex; drawCover(secondCtx, f, secondCanvas.width, secondCanvas.height); }
        }

        const textFade = document.querySelector('.second-content');
        if (textFade) {
            textFade.style.opacity   = 1 - (secondFraction * 2);
            textFade.style.transform = `translateY(${secondFraction * -100}px)`;
        }
    }

    // ── Third ──
    if (thirdSection) {
        const thirdTop      = thirdSection.offsetTop;
        const thirdMax      = thirdSection.offsetHeight - vh;
        const thirdFraction = Math.max(0, Math.min(1, (scrollY - thirdTop) / thirdMax));
        const thirdIndex    = Math.min(thirdFrameCount - 1, Math.floor(thirdFraction * thirdFrameCount));

        if (thirdIndex !== currentThirdFrame) {
            const f = getNearestLoaded(thirdFrames, thirdIndex, 15);
            if (f) { currentThirdFrame = thirdIndex; drawCover(thirdCtx, f, thirdCanvas.width, thirdCanvas.height); }
        }

        const canvasContainer = document.getElementById('third-canvas-container');
        if (canvasContainer) {
            if (thirdFraction > 0.85) {
                canvasContainer.style.opacity = 0;
            } else if (thirdFraction > 0.75) {
                canvasContainer.style.opacity = 1 - ((thirdFraction - 0.75) / 0.10);
            } else {
                canvasContainer.style.opacity = 1;
            }
        }

        const texts = document.querySelectorAll('.seq-text');
        if (texts.length === 4) {
            texts.forEach((text, i) => {
                let opacity = 0, translateY = 50;
                if (i === 3) {
                    if (thirdFraction > 0.85) {
                        const lp = Math.min(1, (thirdFraction - 0.85) / 0.10);
                        opacity = lp; translateY = 50 - lp * 50;
                    }
                } else {
                    const start = i * 0.25, mid = start + 0.125, end = start + 0.25;
                    if (thirdFraction >= start && thirdFraction <= end) {
                        if (thirdFraction < mid) {
                            const lp = (thirdFraction - start) / 0.125;
                            opacity = lp; translateY = 50 - lp * 50;
                        } else {
                            const lp = (thirdFraction - mid) / 0.125;
                            opacity = 1 - lp; translateY = -(lp * 50);
                        }
                    }
                }
                text.style.opacity   = opacity;
                text.style.transform = `translateY(${translateY}px)`;
            });
        }
    }
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => { onScroll(); ticking = false; });
        ticking = true;
    }
}, { passive: true });

// ─── RESIZE ───
window.addEventListener('resize', () => {
    resizeCanvas(heroCanvas, heroCtx);
    if (currentHeroFrame >= 0 && heroFrames[currentHeroFrame]?.naturalWidth)
        drawCover(heroCtx, heroFrames[currentHeroFrame], heroCanvas.width, heroCanvas.height);

    if (secondInitialized) {
        resizeCanvas(secondCanvas, secondCtx);
        if (currentSecondFrame >= 0 && secondFrames[currentSecondFrame]?.naturalWidth)
            drawCover(secondCtx, secondFrames[currentSecondFrame], secondCanvas.width, secondCanvas.height);
    }

    resizeCanvas(thirdCanvas, thirdCtx);
    if (currentThirdFrame >= 0 && thirdFrames[currentThirdFrame]?.naturalWidth)
        drawCover(thirdCtx, thirdFrames[currentThirdFrame], thirdCanvas.width, thirdCanvas.height);
});
