import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { playKey, playEasterEgg } from './lib/synth';
import {
  PALETTE,
  ANIMATION_DURATION,
} from './components/animated-letter';
import type { PaletteColor, LetterStyle } from './components/animated-letter';

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface TypedLetter {
  id: number;
  char: string;
  color: PaletteColor;
  letterStyle: LetterStyle;
  tiltDeg: number;
}

interface FloatingWord {
  id: number;
  text: string;
  color: PaletteColor;
  startX: number;
  durationSec: number;
}

interface Particle {
  id: number;
  color: PaletteColor;
  sizePx: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  gravity: number;
  durationSec: number;
  shape: 'circle' | 'square';
}

interface EmojiBurst {
  id: number;
  glyph: string;
  instances: {
    id: number;
    x: number;
    y: number;
    scale: number;
    durationSec: number;
    driftX: number;
    driftY: number;
  }[];
}

function BottomLetter({
  letter,
  onSpawnParticles,
}: {
  letter: TypedLetter;
  onSpawnParticles: (originX: number, originY: number, color: PaletteColor) => void;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const hasSpawned = useRef(false);

  useLayoutEffect(() => {
    if (hasSpawned.current) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    hasSpawned.current = true;
    onSpawnParticles(r.left + r.width / 2, r.top + r.height / 2, letter.color);
  }, [letter.color, onSpawnParticles]);

  return (
    <motion.span
      ref={ref}
      className="bottomLetter"
      initial={{ scale: 0.5, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      style={{
        transform: `rotate(${letter.tiltDeg}deg)`,
        color: letter.letterStyle === 'outlined' ? 'transparent' : letter.color,
        WebkitTextStroke:
          letter.letterStyle === 'outlined' ? `1px ${letter.color}` : 'none',
        textShadow:
          letter.letterStyle === 'filled'
            ? '0 0 4.5px color-mix(in srgb, currentColor 50%, transparent)'
            : 'none',
      }}
    >
      {letter.char}
    </motion.span>
  );
}

export default function App() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [typedLetters, setTypedLetters] = useState<TypedLetter[]>([]);
  const [floatingWords, setFloatingWords] = useState<FloatingWord[]>([]);
  const [collectedWords, setCollectedWords] = useState<FloatingWord[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [emojiBursts, setEmojiBursts] = useState<EmojiBurst[]>([]);
  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const spawnParticlesAt = useCallback((originX: number, originY: number, color: PaletteColor) => {
    const particleCount = 8 + Math.floor(Math.random() * 5); // 8–12
    const baseId = nextId.current;
    const durationSec = 0.8;
    const gravity = 320; // px/s^2

    setParticles((prev) => {
      const next: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 110; // ~50% slower than previous
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - (80 + Math.random() * 90); // subtler upward bias
        const sizePx = 2 + Math.floor(Math.random() * 3); // 2–4
        const shape: Particle['shape'] = Math.random() < 0.6 ? 'circle' : 'square';
        next.push({
          id: baseId + i,
          color,
          sizePx,
          originX,
          originY,
          vx,
          vy,
          gravity,
          durationSec,
          shape,
        });
      }
      return [...prev, ...next];
    });
  }, []);

  const pushLetter = useCallback((key: string) => {
    const color = pickRandom(PALETTE);
    const letterStyle: LetterStyle = Math.random() < 0.5 ? 'filled' : 'outlined';
    const tiltDeg = Math.random() * 24 - 12;

    setTypedLetters((prev) =>
      prev.length >= 32
        ? prev
        : [...prev, { id: nextId.current++, char: key, color, letterStyle, tiltDeg }],
    );
  }, []);

  const popLetter = useCallback(() => {
    setTypedLetters((prev) => prev.slice(0, -1));
  }, []);

  const submitWord = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();

    const id = nextId.current++;
    const color = pickRandom(PALETTE);
    const startX = Math.random() * 18 - 9; // px drift around center
    const durationSec = 6 + Math.random() * 2;

    const word: FloatingWord = { id, text: trimmed, color, startX, durationSec };
    setFloatingWords((prev) => [...prev, word]);

    const burstId = id;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (lower === 'apple') {
      playEasterEgg('apple');
      const count = 30 + Math.floor(Math.random() * 11); // 30–40
      const instances: EmojiBurst['instances'] = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const scale = 0.5 + Math.random();
        const durationSecEmoji = 2 + Math.random();
        const driftX = (Math.random() - 0.5) * 40;
        const driftY = (Math.random() - 0.5) * 30 - 10;
        instances.push({
          id: burstId * 1000 + i,
          x,
          y,
          scale,
          durationSec: durationSecEmoji,
          driftX,
          driftY,
        });
      }
      setEmojiBursts((prev) => [
        ...prev,
        {
          id: burstId,
          glyph: '🍎',
          instances,
        },
      ]);
    } else if (lower === 'love') {
      playEasterEgg('love');
      const count = 30 + Math.floor(Math.random() * 11); // 30–40
      const instances: EmojiBurst['instances'] = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = height + Math.random() * 80; // start just below bottom
        const scale = 0.7 + Math.random() * 0.8;
        const durationSecEmoji = 2.5 + Math.random() * 0.7; // ~2.5–3.2s
        const driftX = (Math.random() - 0.5) * 40;
        const driftY = -height - Math.random() * 120; // float to top
        instances.push({
          id: burstId * 1000 + i,
          x,
          y,
          scale,
          durationSec: durationSecEmoji,
          driftX,
          driftY,
        });
      }
      setEmojiBursts((prev) => [
        ...prev,
        {
          id: burstId,
          glyph: '💖',
          instances,
        },
      ]);
    } else if (lower === 'star') {
      playEasterEgg('star');
      const count = 40 + Math.floor(Math.random() * 11); // 40–50
      const instances: EmojiBurst['instances'] = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const baseScale = 0.6 + Math.random() * 0.7;
        const durationSecEmoji = 3 + Math.random(); // 3–4s
        const driftX = 0;
        const driftY = 0;
        instances.push({
          id: burstId * 1000 + i,
          x,
          y,
          scale: baseScale,
          durationSec: durationSecEmoji,
          driftX,
          driftY,
        });
      }
      setEmojiBursts((prev) => [
        ...prev,
        {
          id: burstId,
          glyph: '✨',
          instances,
        },
      ]);
    } else if (lower === 'rain') {
      playEasterEgg('rain');
      const count = 50 + Math.floor(Math.random() * 11); // 50–60
      const instances: EmojiBurst['instances'] = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = -50 - Math.random() * 40; // above top
        const scale = 0.7 + Math.random() * 0.6;
        const durationSecEmoji = 1.5 + Math.random(); // 1.5–2.5s
        const driftX = 0;
        const driftY = height + 100; // fall through screen
        instances.push({
          id: burstId * 1000 + i,
          x,
          y,
          scale,
          durationSec: durationSecEmoji,
          driftX,
          driftY,
        });
      }
      setEmojiBursts((prev) => [
        ...prev,
        {
          id: burstId,
          glyph: '💧',
          instances,
        },
      ]);
    } else if (lower === 'fire') {
      playEasterEgg('fire');
      const count = 40 + Math.floor(Math.random() * 11); // 40–50
      const instances: EmojiBurst['instances'] = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = height - 40 + Math.random() * 40; // near bottom
        const scale = 0.8 + Math.random() * 0.4;
        const durationSecEmoji = 2 + Math.random(); // 2–3s
        const driftX = (Math.random() - 0.5) * 30;
        const driftY = -height / 2 - Math.random() * 80; // rise to mid
        instances.push({
          id: burstId * 1000 + i,
          x,
          y,
          scale,
          durationSec: durationSecEmoji,
          driftX,
          driftY,
        });
      }
      setEmojiBursts((prev) => [
        ...prev,
        {
          id: burstId,
          glyph: '🔥',
          instances,
        },
      ]);
    }
  }, []);

  const typedText = typedLetters.map((l) => l.char).join('');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onWindowKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const active = document.activeElement;
      const input = inputRef.current;
      const inputHasFocus = !!input && active === input;
      if (inputHasFocus) return;

      const k = e.key.toUpperCase();
      if (k.length === 1 && k >= 'A' && k <= 'Z') {
        playKey(k);
        pushLetter(k);
        setHasInteracted(true);
        input?.focus();
      } else if (e.key === 'Enter') {
        input?.focus();
      }
    };

    window.addEventListener('keydown', onWindowKeyDown);
    return () => window.removeEventListener('keydown', onWindowKeyDown);
  }, [pushLetter]);

  return (
    <div
      className="appRoot fixed inset-0 overflow-hidden"
      style={{
        fontFamily: "'Space Mono', 'Google Sans Code', monospace",
      }}
    >
      <motion.div className="collectionArea pointer-events-none select-none" layout>
        <AnimatePresence initial={false}>
          {collectedWords.map((w) => (
            <motion.span
              key={w.id}
              className="collectedWord"
              style={{ color: w.color }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 0.9, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              layout
            >
              {w.text}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>

      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none transition-opacity duration-700"
        style={{ opacity: hasInteracted ? 0 : 1 }}
      >
        <span
          style={{
            color: '#FFFFFF',
            opacity: 0.28,
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            fontFamily: "'Space Mono', 'Google Sans Code', monospace",
          }}
        >
          press any key (a–z)
        </span>
      </div>

      <AnimatePresence>
        {emojiBursts.map((burst) =>
          burst.instances.map((inst) => (
            <motion.span
              key={inst.id}
              className="emojiBurst"
              initial={{
                opacity: 0,
                scale: inst.scale * 0.5,
                x: inst.x,
                y: inst.y,
              }}
              animate={
                burst.glyph === '✨'
                  ? {
                      opacity: [0, 1, 0.4, 1, 0],
                      scale: [
                        inst.scale * 0.7,
                        inst.scale,
                        inst.scale * 0.85,
                        inst.scale,
                        inst.scale * 0.7,
                      ],
                    }
                  : burst.glyph === '💧'
                    ? {
                        opacity: [0, 1, 1, 0],
                        x: inst.x,
                        y: [inst.y, inst.y + inst.driftY],
                        scale: inst.scale,
                      }
                    : burst.glyph === '🔥'
                      ? {
                          opacity: [0, 1, 1, 0],
                          x: [
                            inst.x,
                            inst.x + inst.driftX * 0.4,
                            inst.x - inst.driftX * 0.3,
                            inst.x + inst.driftX * 0.2,
                          ],
                          y: [inst.y, inst.y + inst.driftY],
                          scale: [
                            inst.scale * 0.8,
                            inst.scale * 1.2,
                            inst.scale * 0.9,
                            inst.scale * 1.1,
                          ],
                        }
                      : {
                          opacity: [0, 1, 0],
                          scale: [inst.scale * 0.8, inst.scale, inst.scale * 0.6],
                          x: [inst.x, inst.x + inst.driftX, inst.x + inst.driftX * 0.8],
                          y: [inst.y, inst.y + inst.driftY, inst.y + inst.driftY * 0.6],
                        }
              }
              exit={{ opacity: 0 }}
              transition={{
                duration: inst.durationSec,
                ease: 'easeOut',
                times:
                  burst.glyph === '✨'
                    ? [0, 0.25, 0.5, 0.75, 1]
                    : burst.glyph === '💧'
                      ? [0, 1]
                      : burst.glyph === '🔥'
                        ? [0, 0.25, 0.6, 1]
                        : [0, 0.4, 1],
              }}
              onAnimationComplete={() => {
                setEmojiBursts((prev) =>
                  prev
                    .map((b) =>
                      b.id === burst.id
                        ? {
                            ...b,
                            instances: b.instances.filter((x) => x.id !== inst.id),
                          }
                        : b,
                    )
                    .filter((b) => b.instances.length > 0),
                );
              }}
              style={
                burst.glyph === '🔥'
                  ? {
                      textShadow:
                        '0 0 10px rgba(255, 120, 40, 0.7), 0 0 18px rgba(255, 40, 0, 0.55)',
                    }
                  : undefined
              }
            >
              {burst.glyph}
            </motion.span>
          )),
        )}
      </AnimatePresence>

      <div className="bottomWord pointer-events-none select-none">
        {typedLetters.map((l) => (
          <BottomLetter
            key={l.id}
            letter={l}
            onSpawnParticles={spawnParticlesAt}
          />
        ))}
      </div>

      <AnimatePresence>
        {particles.map((p) => {
          const d = p.durationSec;
          const tMid = d * 0.6;
          const endX = p.originX + p.vx * d;
          const midX = p.originX + p.vx * tMid;

          const endY = p.originY + p.vy * d + 0.5 * p.gravity * d * d;
          const midY = p.originY + p.vy * tMid + 0.5 * p.gravity * tMid * tMid;
          return (
            <motion.span
              key={p.id}
              className="particle"
              initial={{
                opacity: 1,
                scale: 1,
                x: p.originX,
                y: p.originY,
              }}
              animate={{
                opacity: 0,
                scale: 0.2,
                x: [p.originX, midX, endX],
                y: [p.originY, midY, endY],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: d, ease: 'easeOut', times: [0, 0.6, 1] }}
              onAnimationComplete={() => {
                setParticles((prev) => prev.filter((x) => x.id !== p.id));
              }}
              style={{
                width: `${p.sizePx}px`,
                height: `${p.sizePx}px`,
                backgroundColor: p.color,
                borderRadius: p.shape === 'circle' ? '999px' : '2px',
              }}
            />
          );
        })}
      </AnimatePresence>

      <AnimatePresence>
        {floatingWords.map((w) => (
          <motion.div
            key={w.id}
            className="floatingWord pointer-events-none select-none"
            initial={{ opacity: 0, x: `calc(50vw + ${w.startX}px)`, y: 'calc(100vh - 78px)' }}
            animate={{
              opacity: [0, 1, 1],
              y: ['calc(100vh - 78px)', '72vh', '52vh', '34vh', '14vh', '5vh'],
              x: [
                `calc(50vw + ${w.startX}px)`,
                `calc(50vw + ${w.startX + 22}px)`,
                `calc(50vw + ${w.startX - 16}px)`,
                `calc(50vw + ${w.startX + 12}px)`,
                `calc(50vw + ${w.startX - 8}px)`,
              ],
            }}
            transition={{
              duration: w.durationSec,
              ease: 'easeOut',
              times: [0, 0.14, 0.36, 0.58, 0.8, 1],
            }}
            onAnimationComplete={() => {
              setFloatingWords((prev) => prev.filter((x) => x.id !== w.id));
              setCollectedWords((prev) => {
                const next = [...prev, w];
                return next.length > 15 ? next.slice(next.length - 15) : next;
              });
            }}
            style={{ color: w.color }}
          >
            {w.text}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="inputBar">
        <div className="inputBarInner">
          <span className="inputPrompt" style={{ color: '#FFFFFF' }}>
            type
          </span>
          <input
            ref={inputRef}
            className="textInput"
            value={typedText}
            readOnly
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;

              if (e.key === 'Enter') {
                e.preventDefault();
                submitWord(typedText);
                setTypedLetters([]);
                setHasInteracted(true);
                return;
              }

              if (e.key === 'Backspace') {
                e.preventDefault();
                popLetter();
                return;
              }

              const k = e.key.toUpperCase();
              if (k.length === 1 && k >= 'A' && k <= 'Z') {
                playKey(k);
                pushLetter(k);
                setHasInteracted(true);
              }
            }}
            placeholder="A–Z"
            inputMode="none"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />
          <span className="inputHint" style={{ color: '#FFFFFF' }}>
            (enter to float)
          </span>
        </div>
      </div>
    </div>
  );
}

