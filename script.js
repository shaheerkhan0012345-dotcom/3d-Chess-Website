const html = document.documentElement;

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
    const cw = canvasW / dpr;
    const ch = canvasH / dpr;
    const iw = img.naturalWidth  || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale, nh = ih * scale;
    ctx.drawImage(img, (cw - nw) / 2, (ch - nh) / 2, nw, nh);
}

// Load a batch of frames starting at `start`, `count` frames, with an optional callback when all are done
function loadFrameBatch(frames, pathFn, start, count, onAllDone) {
    const end = Math.min(start + count, frames.length);
    let loaded = 0;
    const total = end - start;
    if (total <= 0) { if (onAllDone) onAllDone(); return; }

    for (let i = start; i < end; i++) {
        if (frames[i] && frames[i].complete && frames[i].naturalWidth) {
            loaded++;
            if (loaded === total && onAllDone) onAllDone();
            continue;
        }
        const img = new Image();
        img.onload = img.onerror = () => {
            loaded++;
            if (loaded === total && onAllDone) onAllDone();
        };
        img.src = pathFn(i);
        frames[i] = img;
    }
}

// ─── HERO SECTION ───
const heroFrameCount = 82;
const heroFramePath  = i => `chess photos/Chess_pieces_descending_onto_board_202606210034_${String(i).padStart(3,'0')}.png`;

const heroFrames  = new Array(heroFrameCount);
const heroCanvas  = document.getElementById('hero-canvas');
const heroCtx     = heroCanvas.getContext('2d', { alpha: false });
const heroSection = document.getElementById('hero');
let currentHeroFrame = -1;
let heroFullyLoaded  = false;

// Load frame 0 immediately so something shows
resizeCanvas(heroCanvas, heroCtx);
const heroFirst = new Image();
heroFirst.onload = () => {
    heroFrames[0] = heroFirst;
    drawCover(heroCtx, heroFirst, heroCanvas.width, heroCanvas.height);
    currentHeroFrame = 0;
    // Then load the rest in background
    loadFrameBatch(heroFrames, heroFramePath, 1, heroFrameCount - 1, () => { heroFullyLoaded = true; });
};
heroFirst.src = heroFramePath(0);
heroFrames[0] = heroFirst;

// ─── SECOND SECTION ───
const secondFrameCount = 1160;
const secondFramePath  = i => `oops/${String(i + 1).padStart(5,'0')}.png`;

const secondFrames  = new Array(secondFrameCount);
const secondCanvas  = document.getElementById('second-canvas');
const secondCtx     = secondCanvas.getContext('2d', { alpha: false });
const secondSection = document.getElementById('second');
let currentSecondFrame  = -1;
let secondLoadStarted   = false;

// Observe second section — only start loading its frames when user is near it
const secondObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !secondLoadStarted) {
        secondLoadStarted = true;
        secondObserver.disconnect();

        resizeCanvas(secondCanvas, secondCtx);
        const s0 = new Image();
        s0.onload = () => {
            secondFrames[0] = s0;
            drawCover(secondCtx, s0, secondCanvas.width, secondCanvas.height);
            currentSecondFrame = 0;
            // Load rest in chunks to avoid overwhelming the browser
            loadInChunks(secondFrames, secondFramePath, 1, 80);
        };
        s0.src = secondFramePath(0);
        secondFrames[0] = s0;
    }
}, { rootMargin: '200% 0px' }); // start loading when section is 2 viewports away
secondObserver.observe(secondSection);

// ─── THIRD SECTION ───
const thirdFrameCount = 86;
const thirdFramePath  = i => `third/ezgif-frame-${String(i + 1).padStart(3,'0')}.png`;

const thirdFrames  = new Array(thirdFrameCount);
const thirdCanvas  = document.getElementById('third-canvas');
const thirdCtx     = thirdCanvas.getContext('2d', { alpha: false });
const thirdSection = document.getElementById('third');
let currentThirdFrame = -1;
let thirdLoadStarted  = false;

const thirdObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !thirdLoadStarted) {
        thirdLoadStarted = true;
        thirdObserver.disconnect();

        resizeCanvas(thirdCanvas, thirdCtx);
        const t0 = new Image();
        t0.onload = () => {
            thirdFrames[0] = t0;
            drawCover(thirdCtx, t0, thirdCanvas.width, thirdCanvas.height);
            currentThirdFrame = 0;
            loadFrameBatch(thirdFrames, thirdFramePath, 1, thirdFrameCount - 1, null);
        };
        t0.src = thirdFramePath(0);
        thirdFrames[0] = t0;
    }
}, { rootMargin: '200% 0px' });
thirdObserver.observe(thirdSection);

// Load second section frames in chunks of `chunkSize` with small delays so it doesn't block the browser
function loadInChunks(frames, pathFn, start, chunkSize) {
    if (start >= frames.length) return;
    const end = Math.min(start + chunkSize, frames.length);
    for (let i = start; i < end; i++) {
        if (frames[i] && frames[i].complete && frames[i].naturalWidth) continue;
        const img = new Image();
        img.src = pathFn(i);
        frames[i] = img;
    }
    // Schedule next chunk after a short pause so main thread stays free
    setTimeout(() => loadInChunks(frames, pathFn, end, chunkSize), 50);
}

// ─── SCROLL EVENT ───
let ticking = false;

function onScroll() {
    const scrollY = html.scrollTop;

    // Update Hero Sequence
    if (heroSection) {
        const heroMaxScroll = heroSection.offsetHeight - innerHeight;
        const heroFraction  = Math.max(0, Math.min(1, scrollY / heroMaxScroll));
        const heroIndex     = Math.min(heroFrameCount - 1, Math.floor(heroFraction * heroFrameCount));

        if (heroIndex !== currentHeroFrame && heroFrames[heroIndex] && heroFrames[heroIndex].complete && heroFrames[heroIndex].naturalWidth) {
            currentHeroFrame = heroIndex;
            drawCover(heroCtx, heroFrames[heroIndex], heroCanvas.width, heroCanvas.height);
        }
    }

    // Update Second Sequence
    if (secondSection && secondLoadStarted) {
        const secondTop       = secondSection.offsetTop;
        const secondMaxScroll = secondSection.offsetHeight - innerHeight;
        const secondFraction  = Math.max(0, Math.min(1, (scrollY - secondTop) / secondMaxScroll));
        const secondIndex     = Math.min(secondFrameCount - 1, Math.floor(secondFraction * secondFrameCount));

        if (secondIndex !== currentSecondFrame && secondFrames[secondIndex] && secondFrames[secondIndex].complete && secondFrames[secondIndex].naturalWidth) {
            currentSecondFrame = secondIndex;
            drawCover(secondCtx, secondFrames[secondIndex], secondCanvas.width, secondCanvas.height);
        }

        const textFade = document.querySelector('.second-content');
        if (textFade) {
            textFade.style.opacity   = 1 - (secondFraction * 2);
            textFade.style.transform = `translateY(${secondFraction * -100}px)`;
        }
    }

    // Update Third Sequence
    if (thirdSection && thirdLoadStarted) {
        const thirdTop       = thirdSection.offsetTop;
        const thirdMaxScroll = thirdSection.offsetHeight - innerHeight;
        const thirdFraction  = Math.max(0, Math.min(1, (scrollY - thirdTop) / thirdMaxScroll));
        const thirdIndex     = Math.min(thirdFrameCount - 1, Math.floor(thirdFraction * thirdFrameCount));

        if (thirdIndex !== currentThirdFrame && thirdFrames[thirdIndex] && thirdFrames[thirdIndex].complete && thirdFrames[thirdIndex].naturalWidth) {
            currentThirdFrame = thirdIndex;
            drawCover(thirdCtx, thirdFrames[thirdIndex], thirdCanvas.width, thirdCanvas.height);
        }

        // Fade out canvas between 0.75 and 0.85
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
                        opacity    = lp;
                        translateY = 50 - (lp * 50);
                    }
                } else {
                    const start = i * 0.25;
                    const end   = start + 0.25;
                    const mid   = start + 0.125;

                    if (thirdFraction >= start && thirdFraction <= end) {
                        if (thirdFraction < mid) {
                            const lp = (thirdFraction - start) / 0.125;
                            opacity    = lp;
                            translateY = 50 - (lp * 50);
                        } else {
                            const lp = (thirdFraction - mid) / 0.125;
                            opacity    = 1 - lp;
                            translateY = -(lp * 50);
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
        window.requestAnimationFrame(() => {
            onScroll();
            ticking = false;
        });
        ticking = true;
    }
});

// ─── RESIZE EVENT ───
window.addEventListener('resize', () => {
    if (heroCanvas) {
        resizeCanvas(heroCanvas, heroCtx);
        if (currentHeroFrame >= 0 && heroFrames[currentHeroFrame])
            drawCover(heroCtx, heroFrames[currentHeroFrame], heroCanvas.width, heroCanvas.height);
    }
    if (secondCanvas && secondLoadStarted) {
        resizeCanvas(secondCanvas, secondCtx);
        if (currentSecondFrame >= 0 && secondFrames[currentSecondFrame])
            drawCover(secondCtx, secondFrames[currentSecondFrame], secondCanvas.width, secondCanvas.height);
    }
    if (thirdCanvas && thirdLoadStarted) {
        resizeCanvas(thirdCanvas, thirdCtx);
        if (currentThirdFrame >= 0 && thirdFrames[currentThirdFrame])
            drawCover(thirdCtx, thirdFrames[currentThirdFrame], thirdCanvas.width, thirdCanvas.height);
    }
});
