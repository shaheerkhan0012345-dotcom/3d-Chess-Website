const html = document.documentElement;

// ─── HERO SECTION (First sequence) ───
const heroFrameCount = 82;
const heroFramePath = i =>
    `chess photos/Chess_pieces_descending_onto_board_202606210034_${String(i).padStart(3,'0')}.png`;

const heroFrames = new Array(heroFrameCount);
const heroCanvas = document.getElementById('hero-canvas');
const heroCtx = heroCanvas.getContext('2d', { alpha: false });
const heroSection = document.getElementById('hero');
let currentHeroFrame = -1;

for (let i = 0; i < heroFrameCount; i++) {
    const img = new Image();
    heroFrames[i] = img;
    img.onload = () => {
        if (i === 0) {
            resizeCanvas(heroCanvas, heroCtx);
            drawCover(heroCtx, heroFrames[0], heroCanvas.width, heroCanvas.height);
            currentHeroFrame = 0;
        }
    };
    img.src = heroFramePath(i);
}

// ─── SECOND SECTION (Oops folder sequence) ───
const secondFrameCount = 1160;
const secondFramePath = i =>
    `oops/${String(i + 1).padStart(5,'0')}.png`;

const secondFrames = new Array(secondFrameCount);
const secondCanvas = document.getElementById('second-canvas');
const secondCtx = secondCanvas.getContext('2d', { alpha: false });
const secondSection = document.getElementById('second');
let currentSecondFrame = -1;

for (let i = 0; i < secondFrameCount; i++) {
    const img = new Image();
    secondFrames[i] = img;
    img.onload = () => {
        if (i === 0) {
            resizeCanvas(secondCanvas, secondCtx);
            drawCover(secondCtx, secondFrames[0], secondCanvas.width, secondCanvas.height);
            currentSecondFrame = 0;
        }
    };
    img.src = secondFramePath(i);
}

// ─── THIRD SECTION (Third folder sequence) ───
const thirdFrameCount = 74;
const thirdFramePath = i =>
    `third/ezgif-frame-${String(i + 1).padStart(3,'0')}.png`;

const thirdFrames = new Array(thirdFrameCount);
const thirdCanvas = document.getElementById('third-canvas');
const thirdCtx = thirdCanvas.getContext('2d', { alpha: false });
const thirdSection = document.getElementById('third');
let currentThirdFrame = -1;

for (let i = 0; i < thirdFrameCount; i++) {
    const img = new Image();
    thirdFrames[i] = img;
    img.onload = () => {
        if (i === 0) {
            resizeCanvas(thirdCanvas, thirdCtx);
            drawCover(thirdCtx, thirdFrames[0], thirdCanvas.width, thirdCanvas.height);
            currentThirdFrame = 0;
        }
    };
    img.src = thirdFramePath(i);
}

// ─── UTILS ───
function resizeCanvas(canvas, ctx) {
    const dpr = devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawCover(ctx, img, canvasW, canvasH) {
    const dpr = devicePixelRatio || 1;
    const cw = canvasW / dpr;
    const ch = canvasH / dpr;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;

    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const ox = (cw - nw) / 2;
    const oy = (ch - nh) / 2;

    ctx.drawImage(img, ox, oy, nw, nh);
}

// ─── SCROLL EVENT ───
let ticking = false;

function onScroll() {
    const scrollY = html.scrollTop;

    // Update Hero Sequence
    if (heroSection) {
        const heroMaxScroll = heroSection.scrollHeight - innerHeight;
        const heroFraction = Math.max(0, Math.min(1, scrollY / heroMaxScroll));
        const heroIndex = Math.min(heroFrameCount - 1, Math.floor(heroFraction * heroFrameCount));

        if (heroIndex !== currentHeroFrame && heroFrames[heroIndex] && heroFrames[heroIndex].complete) {
            currentHeroFrame = heroIndex;
            drawCover(heroCtx, heroFrames[heroIndex], heroCanvas.width, heroCanvas.height);
        }
    }

    // Update Second Sequence
    if (secondSection) {
        const secondTop = secondSection.offsetTop;
        if (scrollY >= secondTop - innerHeight) {
            const secondMaxScroll = secondSection.scrollHeight - innerHeight;
            const secondFraction = Math.max(0, Math.min(1, (scrollY - secondTop) / secondMaxScroll));
            const secondIndex = Math.min(secondFrameCount - 1, Math.floor(secondFraction * secondFrameCount));

            if (secondIndex !== currentSecondFrame && secondFrames[secondIndex] && secondFrames[secondIndex].complete) {
                currentSecondFrame = secondIndex;
                drawCover(secondCtx, secondFrames[secondIndex], secondCanvas.width, secondCanvas.height);
            }
            
            const textFade = document.querySelector('.second-content');
            if (textFade) {
                textFade.style.opacity = 1 - (secondFraction * 2);
                textFade.style.transform = `translateY(${secondFraction * -100}px)`;
            }
        }
    }

    // Update Third Sequence
    if (thirdSection) {
        const thirdTop = thirdSection.offsetTop;
        if (scrollY >= thirdTop) {
            const thirdMaxScroll = thirdSection.scrollHeight - innerHeight;
            const thirdFraction = Math.max(0, Math.min(1, (scrollY - thirdTop) / thirdMaxScroll));
            const thirdIndex = Math.min(thirdFrameCount - 1, Math.floor(thirdFraction * thirdFrameCount));

            if (thirdIndex !== currentThirdFrame && thirdFrames[thirdIndex] && thirdFrames[thirdIndex].complete) {
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
                    let opacity = 0;
                    let translateY = 50;
                    
                    if (i === 3) {
                        // Final text fades in from 0.85 to 0.95
                        if (thirdFraction > 0.85) {
                            const localProgress = Math.min(1, (thirdFraction - 0.85) / 0.10);
                            opacity = localProgress;
                            translateY = 50 - (localProgress * 50);
                        }
                    } else {
                        const start = i * 0.25;
                        const end = start + 0.25;
                        const mid = start + 0.125;
                        
                        if (thirdFraction >= start && thirdFraction <= end) {
                            if (thirdFraction < mid) {
                                // Fade in and slide up to center
                                const localProgress = (thirdFraction - start) / 0.125;
                                opacity = localProgress;
                                translateY = 50 - (localProgress * 50);
                            } else {
                                // Fade out and slide up away
                                const localProgress = (thirdFraction - mid) / 0.125;
                                opacity = 1 - localProgress;
                                translateY = - (localProgress * 50);
                            }
                        }
                    }
                    
                    text.style.opacity = opacity;
                    text.style.transform = `translateY(${translateY}px)`;
                });
            }
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
        if (currentHeroFrame >= 0) {
            drawCover(heroCtx, heroFrames[currentHeroFrame], heroCanvas.width, heroCanvas.height);
        }
    }

    if (secondCanvas) {
        resizeCanvas(secondCanvas, secondCtx);
        if (currentSecondFrame >= 0) {
            drawCover(secondCtx, secondFrames[currentSecondFrame], secondCanvas.width, secondCanvas.height);
        }
    }

    if (thirdCanvas) {
        resizeCanvas(thirdCanvas, thirdCtx);
        if (currentThirdFrame >= 0) {
            drawCover(thirdCtx, thirdFrames[currentThirdFrame], thirdCanvas.width, thirdCanvas.height);
        }
    }
});
