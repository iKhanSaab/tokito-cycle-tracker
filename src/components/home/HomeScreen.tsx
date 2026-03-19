import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useStore, type Phase, type SnapshotType } from '@/store/useStore';
import { EmojiSlider } from '@/components/inputs/EmojiSlider';
import { CircularSleepSlider } from '@/components/inputs/CircularSleepSlider';
import { DeepLogModal } from './DeepLogModal';
import { BloodDroplet } from './BloodDroplet';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const MOOD_EMOJIS = ['😞', '😕', '😐', '🙂', '😄'];
const ENERGY_EMOJIS = ['🪫', '😴', '😐', '⚡', '🔋'];

const PHASE_INFO: Record<Phase, { label: string; emoji: string; color: string }> = {
  menstrual: { label: 'Menstrual', emoji: '🩸', color: 'bg-menstrual' },
  follicular: { label: 'Follicular', emoji: '🌱', color: 'bg-follicular' },
  ovulation: { label: 'Ovulation', emoji: '⚡', color: 'bg-ovulation' },
  luteal: { label: 'Luteal', emoji: '🌙', color: 'bg-luteal' },
};

const PHASES: Phase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];

function getSnapshotType(): SnapshotType {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export function HomeScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { addLog, getLog, getPhaseForDate, isPeriodActive } = useStore();
  const autoPhase = getPhaseForDate(today);
  const [phaseOverride, setPhaseOverride] = useState<Phase | null>(null);
  const phase = phaseOverride || autoPhase;
  const phaseInfo = PHASE_INFO[phase];
  const snapshotType = getSnapshotType();
  const [activeTab, setActiveTab] = useState<SnapshotType>(snapshotType);

  const existingLog = getLog(today, activeTab);
  const [mood, setMood] = useState(existingLog?.moodQuick ?? 50);
  const [energy, setEnergy] = useState(existingLog?.energyQuick ?? 50);
  const [sleep, setSleep] = useState(existingLog?.sleepHours ?? 7.5);
  const [logged, setLogged] = useState(!!existingLog);
  const [deepLogOpen, setDeepLogOpen] = useState(false);
  const [showPhaseSelect, setShowPhaseSelect] = useState(false);

  const handleLog = () => {
    addLog({
      date: today,
      snapshotType: activeTab,
      moodQuick: mood,
      energyQuick: energy,
      sleepHours: sleep,
      phase,
      timestamp: new Date().toISOString(),
    });
    setLogged(true);
    toast({ title: `✓ Logged at ${format(new Date(), 'hh:mm a')}`, duration: 2000 });
  };

  return (
    <div className="min-h-screen bg-background relative pb-24">
      {/* Period tint */}
      {isPeriodActive && <div className="period-tint" />}

      <div className="max-w-md mx-auto p-4 space-y-4 relative z-10">
        {/* Snapshot tabs */}
        <div className="flex gap-2 bg-muted rounded-full p-1">
          {(['morning', 'afternoon', 'evening'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {tab === 'morning' ? '☀️ Morning' : tab === 'afternoon' ? '🌤 Afternoon' : '🌙 Evening'}
            </button>
          ))}
        </div>

        {/* Main card */}
        <motion.div
          layout
          className="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-5"
        >
          {/* Phase header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold font-heading text-foreground">
                {format(new Date(), 'MMM d')} · {phaseInfo.emoji} {phaseInfo.label}
              </p>
            </div>
            <button
              onClick={() => setShowPhaseSelect(!showPhaseSelect)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Override ▾
            </button>
          </div>

          {showPhaseSelect && (
            <div className="flex gap-2 flex-wrap">
              {PHASES.map((p) => (
                <button
                  key={p}
                  onClick={() => { setPhaseOverride(p); setShowPhaseSelect(false); }}
                  className={`pill-btn text-xs ${phase === p ? 'pill-btn-active' : ''}`}
                >
                  {PHASE_INFO[p].emoji} {PHASE_INFO[p].label}
                </button>
              ))}
            </div>
          )}

          {/* Mood */}
          <EmojiSlider emojis={MOOD_EMOJIS} value={mood} onChange={setMood} label="Mood" />

          {/* Energy */}
          <EmojiSlider emojis={ENERGY_EMOJIS} value={energy} onChange={setEnergy} label="Energy" />

          {/* Sleep */}
          <CircularSleepSlider value={sleep} onChange={setSleep} />

          {/* Log button */}
          {logged ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                ☀️ Logged at {existingLog ? format(new Date(existingLog.timestamp), 'hh:mm a') : format(new Date(), 'hh:mm a')}
              </p>
              <Button onClick={handleLog} variant="outline" className="rounded-full">
                Edit
              </Button>
            </div>
          ) : (
            <Button onClick={handleLog} className="w-full h-12 rounded-full text-base font-semibold">
              Log Now
            </Button>
          )}
        </motion.div>

        {/* Deep Log */}
        <button
          onClick={() => setDeepLogOpen(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all font-medium"
        >
          + Deep Log
        </button>
      </div>

      <BloodDroplet />
      <DeepLogModal open={deepLogOpen} onClose={() => setDeepLogOpen(false)} />
    </div>
  );
}
