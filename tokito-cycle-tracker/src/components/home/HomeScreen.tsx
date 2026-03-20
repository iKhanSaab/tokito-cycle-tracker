import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, type Phase } from '@/store/useStore';
import { EmojiSlider } from '@/components/inputs/EmojiSlider';
import { CircularSleepSlider } from '@/components/inputs/CircularSleepSlider';
import { DeepLogSection } from '@/components/home/DeepLogSection';
import { CalendarView } from '@/components/calendar/CalendarView';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MOOD_EMOJIS = ['😞', '😕', '😐', '🙂', '😄'];
const ENERGY_EMOJIS = ['🪫', '😴', '😐', '⚡', '🔋'];

const PHASE_INFO: Record<Phase, { label: string; emoji: string; color: string }> = {
  menstrual: { label: 'Menstrual', emoji: '🩸', color: 'bg-menstrual' },
  follicular: { label: 'Follicular', emoji: '🌱', color: 'bg-follicular' },
  ovulation: { label: 'Ovulation', emoji: '⚡', color: 'bg-ovulation' },
  luteal: { label: 'Luteal', emoji: '🌙', color: 'bg-luteal' },
};

const PHASES: Phase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];

export function HomeScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { addLog, getLog, getPhaseForDate, isPeriodActive, togglePeriodForDate } = useStore();
  const autoPhase = getPhaseForDate(today);
  const [phaseOverride, setPhaseOverride] = useState<Phase | null>(null);
  const phase = phaseOverride || autoPhase;
  const phaseInfo = PHASE_INFO[phase];

  const existingLog = getLog(today);
  const [mood, setMood] = useState(existingLog?.moodQuick ?? 50);
  const [energy, setEnergy] = useState(existingLog?.energyQuick ?? 50);
  const [sleep, setSleep] = useState(existingLog?.sleepHours ?? 7.5);
  const [logged, setLogged] = useState(!!existingLog);
  const [deepLogOpen, setDeepLogOpen] = useState(false);
  const [showPhaseSelect, setShowPhaseSelect] = useState(false);

  const handleLog = () => {
    addLog({
      date: today,
      moodQuick: mood,
      energyQuick: energy,
      sleepHours: sleep,
      phase,
      timestamp: new Date().toISOString(),
    });
    setLogged(true);
    toast({ title: `✓ Logged at ${format(new Date(), 'hh:mm a')}`, duration: 2000 });
  };

  const handlePeriodToggle = () => {
    togglePeriodForDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-background relative pb-24">
      <div className="max-w-md mx-auto p-4 space-y-2 relative z-10">
        {/* Calendar View with 3 buttons */}
        <CalendarView />

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
              Edit ▾
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

          {/* Period tracking */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-heading">Period Tracking</h2>
            <button
              onClick={() => {
                togglePeriodForDate(new Date().toISOString().split('T')[0]);
                // Auto-expand deep log when period starts
                if (!isPeriodActive) {
                  setDeepLogOpen(true);
                }
              }}
              className={`w-full py-4 rounded-xl text-lg font-semibold transition-all ${
                isPeriodActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isPeriodActive ? '🩸 Period Active' : '➕ Start Period'}
            </button>
          </div>

          {/* Expandable Deep Log */}
          <button
            onClick={() => setDeepLogOpen(!deepLogOpen)}
            className="w-full py-2 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {deepLogOpen ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm">Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span className="text-sm">Deep Log</span>
              </>
            )}
          </button>

          <AnimatePresence>
            {deepLogOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <DeepLogSection />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
