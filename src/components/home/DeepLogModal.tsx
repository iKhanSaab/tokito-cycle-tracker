import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';

export function DeepLogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const { isPeriodActive, setDeepLog, getDeepLog } = useStore();
  const existing = getDeepLog(today);

  const [spotting, setSpotting] = useState(existing.spotting ?? false);
  const [cramps, setCramps] = useState(existing.crampsSeverity ?? 0);
  const [flow, setFlow] = useState(existing.flowHeaviness ?? null);
  const [moodDetailed, setMoodDetailed] = useState(existing.moodDetailed ?? 50);
  const [focus, setFocus] = useState(existing.focusConcentration ?? 50);
  const [bloating, setBloating] = useState(existing.bloating ?? false);
  const [headaches, setHeadaches] = useState(existing.headaches ?? false);
  const [bodyAches, setBodyAches] = useState(existing.bodyAches ?? false);
  const [sleepQuality, setSleepQuality] = useState(existing.sleepQuality ?? undefined);
  const [stress, setStress] = useState(existing.stressLevel ?? 5);
  const [notes, setNotes] = useState(existing.notes ?? '');

  const save = (data: Record<string, any>) => {
    setDeepLog(today, data);
    toast({ title: '✓ Saved', duration: 1500 });
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-t-3xl w-full max-h-[80vh] overflow-y-auto p-6 space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-heading">Deep Log</h2>
            <button onClick={onClose} className="text-muted-foreground text-2xl">×</button>
          </div>

          {/* Q1: Spotting (only if period OFF) */}
          {!isPeriodActive && (
            <Question label="Are you spotting?">
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => { setSpotting(val); save({ spotting: val }); }}
                    className={`pill-btn ${spotting === val ? 'pill-btn-active' : ''}`}
                  >
                    {val ? 'Yes' : 'No'}
                  </button>
                ))}
              </div>
            </Question>
          )}

          {/* Q2: Cramps */}
          <Question label="Any cramps?">
            <BrightnessSlider value={cramps} onChange={(v) => { setCramps(v); save({ crampsSeverity: v }); }} />
          </Question>

          {/* Q3: Flow (only if period ON) */}
          {isPeriodActive && (
            <Question label="How heavy is the flow?">
              <div className="flex gap-3">
                {(['light', 'normal', 'heavy'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFlow(f); save({ flowHeaviness: f }); }}
                    className={`pill-btn capitalize ${flow === f ? 'pill-btn-active' : ''}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </Question>
          )}

          {/* Q4: Mood detailed */}
          <Question label="How are you really feeling emotionally?">
            <BrightnessSlider value={moodDetailed} onChange={(v) => { setMoodDetailed(v); save({ moodDetailed: v }); }} />
          </Question>

          {/* Q5: Focus */}
          <Question label="How's your focus today?">
            <BrightnessSlider value={focus} onChange={(v) => { setFocus(v); save({ focusConcentration: v }); }} />
          </Question>

          {/* Q6-Q8: Symptoms */}
          <Question label="Do you feel bloated?">
            <div className="flex gap-3">
              {[true, false].map((v) => (
                <button key={String(v)} onClick={() => { setBloating(v); save({ bloating: v }); }}
                  className={`pill-btn ${bloating === v ? 'pill-btn-active' : ''}`}
                >
                  {v ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </Question>

          <Question label="Do you have headaches?">
            <div className="flex gap-3">
              {[true, false].map((v) => (
                <button key={String(v)} onClick={() => { setHeadaches(v); save({ headaches: v }); }}
                  className={`pill-btn ${headaches === v ? 'pill-btn-active' : ''}`}
                >
                  {v ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </Question>

          <Question label="Any body aches or pain?">
            <div className="flex gap-3">
              {[true, false].map((v) => (
                <button key={String(v)} onClick={() => { setBodyAches(v); save({ bodyAches: v }); }}
                  className={`pill-btn ${bodyAches === v ? 'pill-btn-active' : ''}`}
                >
                  {v ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </Question>

          {/* Q9: Sleep quality */}
          <Question label="How was your sleep quality?">
            <div className="flex gap-3">
              {(['bad', 'so-so', 'good'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => { setSleepQuality(q); save({ sleepQuality: q }); }}
                  className={`pill-btn capitalize ${sleepQuality === q ? 'pill-btn-active' : ''}`}
                >
                  {q === 'so-so' ? 'So-so' : q.charAt(0).toUpperCase() + q.slice(1)}
                </button>
              ))}
            </div>
          </Question>

          {/* Q10: Stress */}
          <Question label="How stressed are you today?">
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={10}
                value={stress}
                onChange={(e) => { const v = Number(e.target.value); setStress(v); save({ stressLevel: v }); }}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {Array.from({ length: 11 }, (_, i) => (
                  <span key={i}>{i}</span>
                ))}
              </div>
            </div>
          </Question>

          {/* Q11: Notes */}
          <Question label="Anything else?">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => save({ notes })}
              placeholder="e.g., 'Very tired, had extra coffee'"
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground resize-none h-20 text-sm"
            />
          </Question>

          <div className="h-6" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Question({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {children}
    </div>
  );
}

function BrightnessSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="relative">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-3 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, hsl(var(--muted)) 0%, hsl(var(--primary)) ${value}%, hsl(var(--muted)) ${value}%)`,
        }}
      />
    </div>
  );
}
