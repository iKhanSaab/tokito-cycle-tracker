import { useState } from 'react';
import { motion } from 'framer-motion';

interface EmojiSliderProps {
  emojis: string[];
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export function EmojiSlider({ emojis, value, onChange, label }: EmojiSliderProps) {
  const index = Math.round((value / 100) * (emojis.length - 1));

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="emoji-slider-track py-2 px-1">
        {emojis.map((emoji, i) => {
          const isSelected = i === index;
          return (
            <motion.button
              key={i}
              onClick={() => onChange((i / (emojis.length - 1)) * 100)}
              whileTap={{ scale: 1.3 }}
              className={`text-2xl transition-all duration-200 ${
                isSelected ? 'scale-125 drop-shadow-md' : 'opacity-40 scale-90'
              }`}
              style={{ filter: isSelected ? 'none' : 'grayscale(0.5)' }}
            >
              {emoji}
            </motion.button>
          );
        })}
      </div>
      {/* Hidden range for smooth dragging */}
      <input
        type="range"
        min={0}
        max={100}
        step={25}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
}
