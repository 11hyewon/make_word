import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { playKey } from './lib/synth';

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

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function App() {
  const [letters, setLetters] = useState<ActiveLetter[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const nextId = useRef(0);

  const handleKey = useCallback((raw: KeyboardEvent) => {
    const k = raw.key.toUpperCase();
    if (k.length !== 1 || k < 'A' || k > 'Z') return;

    playKey(k);
    setHasInteracted(true);

    const color = pickRandom(PALETTE);
    const letterStyle: LetterStyle = Math.random() < 0.5 ? 'filled' : 'outlined';
    const tiltDeg = Math.random() * 24 - 12;
    const id = nextId.current++;

    setLetters((prev) => [...prev, { id, char: k, color, letterStyle, tiltDeg }]);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div
      className="appRoot fixed inset-0 overflow-hidden"
      style={{
        fontFamily: "'Space Mono', 'Google Sans Code', monospace",
      }}
    >
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
    </div>
  );
}

