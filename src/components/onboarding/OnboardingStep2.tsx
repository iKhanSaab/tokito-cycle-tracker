import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';

const SYMPTOMS = [
  { key: 'menstrual', label: 'Menstrual symptoms', desc: 'Cramps, flow, spotting' },
  { key: 'mood', label: 'Mood', desc: 'Irritability, anxiety, focus' },
  { key: 'physical', label: 'Physical', desc: 'Bloating, headaches, body aches' },
  { key: 'energy', label: 'Energy/sleep quality', desc: 'Fatigue, sleep tracking' },
  { key: 'hormone', label: 'Hormone-specific', desc: 'PCOS, thyroid, etc.' },
];

export function OnboardingStep2({ onNext }: { onNext: () => void }) {
  const setProfile = useStore((s) => s.setProfile);
  const [selected, setSelected] = useState<string[]>(SYMPTOMS.map((s) => s.key));

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleContinue = () => {
    setProfile({ selectedSymptoms: selected });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-heading text-foreground">What matters most to you?</h1>
        <p className="text-muted-foreground mt-1">Choose what you'd like to track</p>
      </div>

      <div className="space-y-3">
        {SYMPTOMS.map((s) => (
          <button
            key={s.key}
            onClick={() => toggle(s.key)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selected.includes(s.key)
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  selected.includes(s.key) ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                }`}
              >
                {selected.includes(s.key) && (
                  <span className="text-primary-foreground text-xs">✓</span>
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{s.label}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Button onClick={handleContinue} className="w-full h-12 text-base font-semibold rounded-full">
        Continue
      </Button>
    </div>
  );
}
