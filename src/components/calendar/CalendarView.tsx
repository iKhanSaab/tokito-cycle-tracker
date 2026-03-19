import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, type Phase } from '@/store/useStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MOOD_EMOJIS = ['😞', '😕', '😐', '🙂', '😄'];
const ENERGY_EMOJIS = ['🪫', '😴', '😐', '⚡', '🔋'];

type Overlay = 'none' | 'mood' | 'energy' | 'sleep';

const PHASE_COLORS: Record<Phase, string> = {
  menstrual: 'bg-menstrual/40',
  follicular: 'bg-follicular/35',
  ovulation: 'bg-ovulation/30',
  luteal: 'bg-luteal/25',
};

const PHASE_INFO: Record<Phase, { label: string; description: string; dayRange: string }> = {
  menstrual: { label: 'Menstrual Phase', description: 'Bleeding, resting. Take it easy.', dayRange: 'Days 1-5' },
  follicular: { label: 'Follicular Phase', description: 'Growing energy. Great time to start new things.', dayRange: 'Days 6-12' },
  ovulation: { label: 'Ovulation Phase', description: 'Peak energy & focus. You may feel your best!', dayRange: 'Days 13-15' },
  luteal: { label: 'Luteal Phase', description: 'Lower energy & focus common. Rest is important.', dayRange: 'Days 16-28' },
};

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [overlay, setOverlay] = useState<Overlay>('none');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { getPhaseForDate, getLog, getDeepLog, logs } = useStore();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    const result: Date[] = [];
    let day = start;
    while (day <= end) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [currentMonth]);

  const toggleOverlay = (type: Overlay) => {
    setOverlay((prev) => (prev === type ? 'none' : type));
  };

  const selectedLog = selectedDate ? getLog(selectedDate) : null;
  const selectedDeep = selectedDate ? getDeepLog(selectedDate) : null;
  const selectedPhase = selectedDate ? getPhaseForDate(selectedDate) : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-muted">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-lg font-bold font-heading text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-muted">
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-xs font-medium text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const phase = getPhaseForDate(dateStr);
            const log = getLog(dateStr);

            let content: React.ReactNode = format(day, 'd');

            if (overlay === 'mood' && log) {
              const idx = Math.round((log.moodQuick / 100) * 4);
              content = <span className="text-base">{MOOD_EMOJIS[idx]}</span>;
            } else if (overlay === 'energy' && log) {
              const idx = Math.round((log.energyQuick / 100) * 4);
              content = <span className="text-base">{ENERGY_EMOJIS[idx]}</span>;
            } else if (overlay === 'sleep' && log) {
              content = <span className="text-[10px] font-medium">{log.sleepHours}h</span>;
            }

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                  isCurrentMonth ? PHASE_COLORS[phase] : 'opacity-30'
                } ${isToday ? 'ring-2 ring-primary' : ''} ${
                  selectedDate === dateStr ? 'ring-2 ring-foreground' : ''
                }`}
              >
                {content}
              </button>
            );
          })}
        </div>

        {/* Toggle buttons */}
        <div className="flex gap-2 justify-center">
          {([
            { key: 'mood' as const, icon: '😊', label: 'Mood' },
            { key: 'energy' as const, icon: '⚡', label: 'Energy' },
            { key: 'sleep' as const, icon: '😴', label: 'Sleep' },
          ]).map((btn) => (
            <button
              key={btn.key}
              onClick={() => toggleOverlay(btn.key)}
              className={`pill-btn ${overlay === btn.key ? 'pill-btn-active' : ''}`}
            >
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>

        {/* Day detail card */}
        <AnimatePresence>
          {selectedDate && selectedPhase && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold font-heading text-foreground">
                    {PHASE_INFO[selectedPhase].label}
                  </h3>
                  <p className="text-sm text-muted-foreground">{PHASE_INFO[selectedPhase].dayRange}</p>
                </div>
                <button onClick={() => setSelectedDate(null)} className="text-muted-foreground text-xl">×</button>
              </div>

              <p className="text-sm text-muted-foreground">{PHASE_INFO[selectedPhase].description}</p>

              {selectedLog ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Today's Snapshot</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-muted rounded-xl p-2">
                      <p className="text-lg">{MOOD_EMOJIS[Math.round((selectedLog.moodQuick / 100) * 4)]}</p>
                      <p className="text-xs text-muted-foreground">Mood</p>
                    </div>
                    <div className="bg-muted rounded-xl p-2">
                      <p className="text-lg">{ENERGY_EMOJIS[Math.round((selectedLog.energyQuick / 100) * 4)]}</p>
                      <p className="text-xs text-muted-foreground">Energy</p>
                    </div>
                    <div className="bg-muted rounded-xl p-2">
                      <p className="text-lg font-bold text-foreground">{selectedLog.sleepHours}h</p>
                      <p className="text-xs text-muted-foreground">Sleep</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No log for this day</p>
              )}

              {selectedDeep && (
                <div className="space-y-1 text-sm">
                  <h4 className="font-semibold text-foreground">Deep Log</h4>
                  {selectedDeep.crampsSeverity !== undefined && (
                    <p className="text-muted-foreground">Cramps: {selectedDeep.crampsSeverity > 60 ? 'Severe' : selectedDeep.crampsSeverity > 30 ? 'Moderate' : 'Mild'}</p>
                  )}
                  {selectedDeep.bloating && <p className="text-muted-foreground">Bloating: Yes</p>}
                  {selectedDeep.headaches && <p className="text-muted-foreground">Headaches: Yes</p>}
                  {selectedDeep.stressLevel !== undefined && (
                    <p className="text-muted-foreground">Stress: {selectedDeep.stressLevel}/10</p>
                  )}
                  {selectedDeep.notes && <p className="text-muted-foreground italic">"{selectedDeep.notes}"</p>}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
