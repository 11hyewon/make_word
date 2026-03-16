import { motion } from 'motion/react';
import { useMemo } from 'react';

export const ANIMATION_DURATION = 1.4; // seconds

export const PALETTE = [
  '#C6FF33',
  '#FFFFFF',
  '#7D39EB',
  '#FF4502',
] as const;

export type PaletteColor = (typeof PALETTE)[number];
export type LetterStyle = 'filled' | 'outlined';

interface AnimatedLetterProps {
  id: number;
  letter: string;
  color: PaletteColor;
  letterStyle: LetterStyle;
  left: string;
  top: string;
  centerX?: boolean;
  onAnimationComplete: () => void;
}

export function AnimatedLetter({
  id,
  letter,
  color,
  letterStyle,
  left,
  top,
  centerX = false,
  onAnimationComplete,
}: AnimatedLetterProps) {
  const seed = useMemo(() => id * 37, [id]);

  const rotation = useMemo(() => ((seed * 5) % 60) - 30, [seed]);
  const scale = useMemo(() => 0.8 + (((seed * 7) % 30) / 100), [seed]);

  return (
    <motion.span
      initial={{
        x: centerX ? '-50%' : 0,
        y: 0,
        opacity: 0,
        scale: scale * 0.7,
      }}
      animate={{
        y: -110,
        opacity: 1,
        scale,
        rotate: rotation,
      }}
      exit={{
        opacity: 0,
        scale: scale * 0.2,
        y: -160,
      }}
      transition={{
        duration: ANIMATION_DURATION,
        ease: [0.21, 0.8, 0.35, 1],
      }}
      style={{
        position: 'absolute',
        left,
        top,
        zIndex: 7,
        color: letterStyle === 'outlined' ? 'transparent' : color,
        fontSize: '5rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        WebkitTextStroke:
          letterStyle === 'outlined' ? `1.4px ${color}` : 'none',
        filter:
          letterStyle === 'filled' ? 'drop-shadow(0 0 18px currentColor)' : 'none',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
        userSelect: 'none',
        transformOrigin: 'center',
      }}
      onAnimationComplete={onAnimationComplete}
    >
      {letter}
    </motion.span>
  );
}

