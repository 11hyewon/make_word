import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { playKey, playEasterEgg } from './lib/synth';

const PALETTE = ['#C6FF33', '#FFFFFF', '#7D39EB', '#FF4502'] as const;
type PaletteColor = (typeof PALETTE)[number];
type LetterStyle = 'filled' | 'outlined';

interface ActiveLetter {
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
}

interface EmojiInstance {
  id: number;
  x: number;
  y: number;
  scale: number;
  durationSec: number;
  driftX: number;
  driftY: number;
}

interface EmojiBurst {
  id: number;
  glyph: string;
  instances: EmojiInstance[];
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function App() {
  const [letters, setLetters] = useState<ActiveLetter[]>([]);
  const [typed, setTyped] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [floatingWords, setFloatingWords] = useState<FloatingWord[]>([]);
  const [topWords, setTopWords] = useState<string[]>([]);
  const [emojiBursts, setEmojiBursts] = useState<EmojiBurst[]>([]);
  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const spawnLettersForWord = useCallback((word: string) => {
    const chars = word.split('');
    setLetters(
      chars.map((ch) => {
        const color = pickRandom(PALETTE);
        const letterStyle: LetterStyle = Math.random() < 0.5 ? 'filled' : 'outlined';
        const tiltDeg = Math.random() * 24 - 12;
        return {
          id: nextId.current++,
          char: ch.toUpperCase(),
          color,
          letterStyle,
          tiltDeg,
        };
      }),
    );
  }, []);

  const triggerEasterEgg = useCallback(
    (lower: string, id: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const burstId = id;

      if (lower === 'apple') {
        playEasterEgg('apple');
        const count = 30 + Math.floor(Math.random() * 11);
        const instances: EmojiInstance[] = [];
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
        setEmojiBursts((prev) => [...prev, { id: burstId, glyph: '🍎', instances }]);
      } else if (lower === 'love') {
        playEasterEgg('love');
        const count = 30 + Math.floor(Math.random() * 11);
        const instances: EmojiInstance[] = [];
        for (let i = 0; i < count; i++) {
          const x = Math.random() * width;
          const y = height + Math.random() * 80;
          const scale = 0.7 + Math.random() * 0.8;
          const durationSecEmoji = 2.5 + Math.random() * 0.7;
          const driftX = (Math.random() - 0.5) * 40;
          const driftY = -height - Math.random() * 120;
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
        setEmojiBursts((prev) => [...prev, { id: burstId, glyph: '💖', instances }]);
      } else if (lower === 'star') {
        playEasterEgg('star');
        const count = 40 + Math.floor(Math.random() * 11);
        const instances: EmojiInstance[] = [];
        for (let i = 0; i < count; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const scale = 0.6 + Math.random() * 0.7;
          const durationSecEmoji = 3 + Math.random();
          instances.push({
            id: burstId * 1000 + i,
            x,
            y,
            scale,
            durationSec: durationSecEmoji,
            driftX: 0,
            driftY: 0,
          });
        }
        setEmojiBursts((prev) => [...prev, { id: burstId, glyph: '✨', instances }]);
      } else if (lower === 'rain') {
        playEasterEgg('rain');
        const count = 50 + Math.floor(Math.random() * 11);
        const instances: EmojiInstance[] = [];
        for (let i = 0; i < count; i++) {
          const x = Math.random() * width;
          const y = -50 - Math.random() * 40;
          const scale = 0.7 + Math.random() * 0.6;
          const durationSecEmoji = 1.5 + Math.random();
          instances.push({
            id: burstId * 1000 + i,
            x,
            y,
            scale,
            durationSec: durationSecEmoji,
            driftX: 0,
            driftY: height + 100,
          });
        }
        setEmojiBursts((prev) => [...prev, { id: burstId, glyph: '💧', instances }]);
      } else if (lower === 'fire') {
        playEasterEgg('fire');
        const count = 40 + Math.floor(Math.random() * 11);
        const instances: EmojiInstance[] = [];
        for (let i = 0; i < count; i++) {
          const x = Math.random() * width;
          const y = height - 40 + Math.random() * 40;
          const scale = 0.8 + Math.random() * 0.4;
          const durationSecEmoji = 2 + Math.random();
          const driftX = (Math.random() - 0.5) * 30;
          const driftY = -height / 2 - Math.random() * 80;
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
        setEmojiBursts((prev) => [...prev, { id: burstId, glyph: '🔥', instances }]);
      }
    },
    [],
  );

  const handleSubmitWord = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const lower = trimmed.toLowerCase();
      const id = nextId.current++;
      const color = pickRandom(PALETTE);

      setFloatingWords((prev) => [...prev, { id, text: trimmed, color }]);
      triggerEasterEgg(lower, id);
      setTyped('');
      setLetters([]);
    },
    [triggerEasterEgg],
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e as any).nativeEvent.isComposing) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmitWord(typed);
        setHasInteracted(true);
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        setTyped((prev) => prev.slice(0, -1));
        setLetters((prev) => prev.slice(0, -1));
        return;
      }

      const k = e.key.toUpperCase();
      if (k.length === 1 && k >= 'A' && k <= 'Z') {
        e.preventDefault();
        playKey(k);
        setHasInteracted(true);

        setTyped((prev) => (prev.length >= 32 ? prev : prev + k));

        const color = pickRandom(PALETTE);
        const letterStyle: LetterStyle = Math.random() < 0.5 ? 'filled' : 'outlined';
        const tiltDeg = Math.random() * 24 - 12;
        const id = nextId.current++;
        setLetters((prev) => [...prev, { id, char: k, color, letterStyle, tiltDeg }]);
      }
    },
    [handleSubmitWord, typed],
  );

  return (
    <div
      className="appRoot fixed inset-0 overflow-hidden"
      style={{
        fontFamily: "'Space Mono', 'Google Sans Code', monospace",
      }}
    >
      {/* Top collected words */}
      <div className="collectionArea pointer-events-none select-none">
        {topWords.map((w, idx) => (
          <span key={`${w}-${idx}`} className="collectedWord">
            {w}
          </span>
        ))}
      </div>

      {/* Hint */}
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
          type a word (a–z) and press enter
        </span>
      </div>

      {/* Emoji easter eggs */}
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
                        ? { ...b, instances: b.instances.filter((x) => x.id !== inst.id) }
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

      {/* Floating words from bottom to top stack */}
      <AnimatePresence>
        {floatingWords.map((w) => (
          <motion.div
            key={w.id}
            initial={{ opacity: 1, y: 'calc(100vh - 120px)' }}
            animate={{ opacity: 0, y: '40px' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setFloatingWords((prev) => prev.filter((x) => x.id !== w.id));
              setTopWords((prev) => [...prev, w.text]);
            }}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              color: w.color,
              pointerEvents: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontSize: '0.9rem',
            }}
          >
            {w.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Bottom word letters */}
      <div className="bottomWord pointer-events-none select-none">
        <AnimatePresence>
          {letters.map((l, idx) => (
            <motion.span
              key={l.id}
              initial={{ scale: 0.5, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.6, y: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
              className="bottomLetter"
              style={{
                marginLeft: idx === 0 ? 0 : '-0.05em',
                transform: `rotate(${l.tiltDeg}deg)`,
                color: l.letterStyle === 'outlined' ? 'transparent' : l.color,
                WebkitTextStroke:
                  l.letterStyle === 'outlined' ? `1px ${l.color}` : 'none',
                textShadow:
                  l.letterStyle === 'filled'
                    ? '0 0 4.5px color-mix(in srgb, currentColor 50%, transparent)'
                    : 'none',
              }}
            >
              {l.char}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom input bar */}
      <div className="inputBar">
        <div className="inputBarInner">
          <span className="inputPrompt" style={{ color: '#FFFFFF' }}>
            type
          </span>
          <input
            ref={inputRef}
            className="textInput"
            value={typed}
            readOnly
            onKeyDown={handleInputKeyDown}
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


