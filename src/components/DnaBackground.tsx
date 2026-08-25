'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

const LETTERS = ['A', 'T', 'G', 'C'];
const COL_WIDTH = 25;
const ROW_HEIGHT = 28;
const FONT_SIZE = 14;
const FONT_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

// Sprite cell size in CSS pixels, large enough to hold one glyph.
const SPRITE_W = 16;
const SPRITE_H = 20;

// Pre-rendered brightness levels, spanning the twinkle floor up to the
// brightest a letter gets at a ripple crest. The top of the range is
// palette-dependent, so both themes spend all 32 steps on the range they
// actually use.
const ALPHA_STEPS = 32;
const MIN_FACTOR = 0.5;

const TWINKLE_PERIOD_MS = 2000;
// The idle pulse is slow enough that 30fps is indistinguishable from 60; the
// ripple tracks the cursor, so it gets the full rate.
const FRAME_INTERVAL_IDLE = 1000 / 30;
const FRAME_INTERVAL_ACTIVE = 1000 / 60;
// Guard against absurd letter counts on very large displays.
const MAX_LETTERS = 4000;

// Ripple shape.
const RIPPLE_RADIUS = 190;
const RIPPLE_WAVELENGTH = 58;
const RIPPLE_SPEED_MS = 1100;
// How fast the ripple centre chases the cursor, and how fast it fades in/out.
const CENTRE_EASE = 0.22;
const AMPLITUDE_EASE = 0.1;

// `a` is the resting alpha, `ripple` how far a crest lifts the brightness
// factor above it. Dark mode starts from nearly twice the resting alpha, so it
// needs a smaller lift to land at a comparable crest.
type Palette = { r: number; g: number; b: number; a: number; ripple: number };

const LIGHT: Palette = { r: 0, g: 0, b: 0, a: 0.08, ripple: 2.4 };
const DARK: Palette = { r: 255, g: 255, b: 255, a: 0.15, ripple: 1.3 };

// Twinkle peaks at 1.0, and a crest adds the palette's ripple lift on top.
const maxFactor = (palette: Palette) => 1 + palette.ripple;

const cellWidth = (dpr: number) => Math.ceil(SPRITE_W * dpr);
const cellHeight = (dpr: number) => Math.ceil(SPRITE_H * dpr);

/**
 * Pre-renders every letter at every brightness level into one atlas so the
 * render loop only has to blit, never shape text.
 */
function buildAtlas(palette: Palette, dpr: number): HTMLCanvasElement {
  const cellW = cellWidth(dpr);
  const cellH = cellHeight(dpr);

  const atlas = document.createElement('canvas');
  atlas.width = cellW * LETTERS.length;
  atlas.height = cellH * ALPHA_STEPS;

  const ctx = atlas.getContext('2d');
  if (!ctx) return atlas;

  // Everything here is in device pixels so the source rects below line up
  // exactly with the cells, whatever the device pixel ratio.
  ctx.font = `${FONT_SIZE * dpr}px ${FONT_STACK}`;
  ctx.textBaseline = 'top';

  const span = maxFactor(palette) - MIN_FACTOR;

  for (let step = 0; step < ALPHA_STEPS; step++) {
    const factor = MIN_FACTOR + (span * step) / (ALPHA_STEPS - 1);
    const alpha = Math.min(1, palette.a * factor);
    ctx.fillStyle = `rgba(${palette.r}, ${palette.g}, ${palette.b}, ${alpha})`;
    for (let i = 0; i < LETTERS.length; i++) {
      ctx.fillText(LETTERS[i], i * cellW + 2 * dpr, step * cellH + 3 * dpr);
    }
  }

  return atlas;
}

export default function DnaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const paletteRef = useRef<Palette>(theme === 'dark' ? DARK : LIGHT);
  const atlasRef = useRef<HTMLCanvasElement | null>(null);
  const dprRef = useRef(1);
  const redrawRef = useRef<(() => void) | null>(null);

  // Keep the palette in a ref so a theme flip never re-runs the canvas setup:
  // recolouring is just a new sprite atlas plus one repaint.
  useEffect(() => {
    paletteRef.current = theme === 'dark' ? DARK : LIGHT;
    atlasRef.current = buildAtlas(paletteRef.current, dprRef.current);
    redrawRef.current?.();
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Touch-only devices have no cursor to ripple around.
    const canRipple = !reducedMotion && window.matchMedia('(hover: hover)').matches;

    // Grid state, stored in flat typed arrays to keep per-frame work cheap.
    let letterIndex = new Uint8Array(0);
    let phase = new Float32Array(0);
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);
    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastFrame = 0;

    // Ripple state: the raw cursor, the eased centre that trails it, and an
    // amplitude that fades the whole effect in and out with the cursor.
    let pointerX = 0;
    let pointerY = 0;
    let centreX = 0;
    let centreY = 0;
    let pointerInside = false;
    let amplitude = 0;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      atlasRef.current = buildAtlas(paletteRef.current, dpr);

      const cols = Math.ceil(width / COL_WIDTH);
      const rows = Math.ceil(height / ROW_HEIGHT);
      const count = Math.min(cols * rows, MAX_LETTERS);

      letterIndex = new Uint8Array(count);
      phase = new Float32Array(count);
      xs = new Float32Array(count);
      ys = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        letterIndex[i] = Math.floor(Math.random() * LETTERS.length);
        phase[i] = Math.random();
        xs[i] = (i % cols) * COL_WIDTH;
        ys[i] = Math.floor(i / cols) * ROW_HEIGHT;
      }
    };

    const draw = (time: number) => {
      const atlas = atlasRef.current;
      if (!atlas) return;

      const dpr = dprRef.current;
      const sw = cellWidth(dpr);
      const sh = cellHeight(dpr);
      const cycle = time / TWINKLE_PERIOD_MS;

      // Ease the ripple centre and amplitude toward the cursor's state.
      amplitude += ((pointerInside ? 1 : 0) - amplitude) * AMPLITUDE_EASE;
      if (amplitude < 0.004) amplitude = 0;
      centreX += (pointerX - centreX) * CENTRE_EASE;
      centreY += (pointerY - centreY) * CENTRE_EASE;

      const palette = paletteRef.current;
      const rippleOn = amplitude > 0;
      const rippleStrength = palette.ripple;
      const span = maxFactor(palette) - MIN_FACTOR;
      const radiusSq = RIPPLE_RADIUS * RIPPLE_RADIUS;
      const waveK = (2 * Math.PI) / RIPPLE_WAVELENGTH;
      const waveT = (2 * Math.PI * time) / RIPPLE_SPEED_MS;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < letterIndex.length; i++) {
        // 0.75 - 0.25*cos gives the same eased 0.5 -> 1 -> 0.5 pulse as the
        // old CSS keyframes.
        let v = reducedMotion
          ? 0.75
          : 0.75 - 0.25 * Math.cos(2 * Math.PI * (cycle + phase[i]));

        if (rippleOn) {
          const dx = xs[i] + SPRITE_W / 2 - centreX;
          const dy = ys[i] + SPRITE_H / 2 - centreY;
          const distSq = dx * dx + dy * dy;
          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            // Squared falloff so the rings dissolve softly at the edge.
            const falloff = 1 - dist / RIPPLE_RADIUS;
            // Subtracting the time term makes the crests travel outward.
            const wave = 0.5 + 0.5 * Math.cos(dist * waveK - waveT);
            v += rippleStrength * amplitude * falloff * falloff * wave;
          }
        }

        let step = Math.round(((v - MIN_FACTOR) / span) * (ALPHA_STEPS - 1));
        if (step < 0) step = 0;
        else if (step > ALPHA_STEPS - 1) step = ALPHA_STEPS - 1;

        ctx.drawImage(
          atlas,
          letterIndex[i] * sw,
          step * sh,
          sw,
          sh,
          xs[i],
          ys[i],
          SPRITE_W,
          SPRITE_H
        );
      }
    };

    const loop = (time: number) => {
      frameId = requestAnimationFrame(loop);
      const interval =
        pointerInside || amplitude > 0 ? FRAME_INTERVAL_ACTIVE : FRAME_INTERVAL_IDLE;
      if (time - lastFrame < interval) return;
      lastFrame = time;
      draw(time);
    };

    const start = () => {
      if (frameId) return;
      lastFrame = 0;
      frameId = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (!frameId) return;
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    layout();
    // Lets the theme effect repaint immediately when no loop is running.
    redrawRef.current = () => draw(performance.now());

    if (reducedMotion) {
      draw(0);
    } else {
      start();
    }

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Ignore the viewport shrinking at a constant width - that's the mobile
        // keyboard opening, and reshuffling the letters mid-typing is jarring.
        if (window.innerWidth === width && window.innerHeight <= height) return;
        layout();
        if (reducedMotion) draw(0);
      }, 200);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!pointerInside) {
        // Snap on entry so the ripple doesn't fly in from the last position.
        centreX = pointerX;
        centreY = pointerY;
        pointerInside = true;
      }
    };

    const handlePointerLeave = () => {
      pointerInside = false;
    };

    const handleVisibility = () => {
      if (reducedMotion) return;
      if (document.hidden) {
        pointerInside = false;
        stop();
      } else {
        start();
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);
    if (canRipple) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.addEventListener('pointerleave', handlePointerLeave);
      window.addEventListener('blur', handlePointerLeave);
    }

    return () => {
      stop();
      redrawRef.current = null;
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="dna-background" aria-hidden="true" />;
}
