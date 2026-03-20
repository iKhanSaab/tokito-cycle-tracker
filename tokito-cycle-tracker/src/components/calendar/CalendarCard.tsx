import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, type Phase } from '@/store/useStore';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const MOOD_EMOJIS = ['😞', '😕', '😐', '🙂', '😄'];
const ENERGY_EMOJIS = ['🪫', '😴', '😐', '⚡', '🔋'];

const PHASE_INFO: Record<Phase, { label: string; description: string; dayRange: string }> = {
  menstrual: { label: 'Menstrual Phase', description: 'Bleeding, resting. Take it easy.', dayRange: 'Days 1-5' },
  follicular: { label: 'Follicular Phase', description: 'Growing energy. Great time to start new things.', dayRange: 'Days 6-12' },
  ovulation: { label: 'Ovulation Phase', description: 'Peak energy & focus. You may feel your best!', dayRange: 'Days 13-15' },
  luteal: { label: 'Luteal Phase', description: 'Lower energy & focus common. Rest is important.', dayRange: 'Days 16-28' },
};

export function CalendarCard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { getPhaseForDate, getLog, getDeepLog, logs } = useStore();

  // Get all dates that have logged data
  const loggedDates = useMemo(() => {
    return new Set(logs.map(l => l.date));
  }, [logs]);

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

  const selectedLog = selectedDate ? getLog(selectedDate) : null;
  const selectedDeep = selectedDate ? getDeepLog(selectedDate) : null;
  const selectedPhase = selectedDate ? getPhaseForDate(selectedDate) : null;

  return (
    <>
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 rounded-full hover:bg-muted">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <h2 className="text-sm font-bold font-heading text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 rounded-full hover:bg-muted">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-[10px] font-medium text-muted-foreground">{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const hasData = loggedDates.has(dateStr);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                disabled={!isCurrentMonth}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all ${
                  isCurrentMonth ? 'hover:bg-muted' : 'opacity-25'
                } ${isToday ? 'ring-1 ring-primary' : ''} ${
                  selectedDate === dateStr ? 'bg-primary text-primary-foreground' : ''
                } ${hasData && isCurrentMonth ? 'bg-primary/20' : ''}`}
              >
                <span className="text-xs">{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full-screen day detail popup */}
      <AnimatePresence>
        {selectedDate && selectedPhase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto"
          >
            <div className="min-h-screen max-w-md mx-auto p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold font-heading text-foreground">
                  {format(new Date(selectedDate), 'EEEE, MMM d')}
                </h2>
                <button 
                  onClick={() => setSelectedDate(null)} 
                  className="p-2 rounded-full bg-muted"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>

              {/* Phase info */}
              <div className="bg-card rounded-2xl p-5 border border-border mb-4">
                <h3 className="font-bold font-heading text-foreground">
                  {PHASE_INFO[selectedPhase].label}
                </h3>
                <p className="text-sm text-muted-foreground">{PHASE_INFO[selectedPhase].dayRange}</p>
                <p className="text-sm text-muted-foreground mt-1">{PHASE_INFO[selectedPhase].description}</p>
              </div>

              {/* Quick log */}
              {selectedLog ? (
                <div className="bg-card rounded-2xl p-5 border border-border mb-4">
                  <h4 className="font-semibold text-foreground mb-3">Daily Snapshot</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-2xl">{MOOD_EMOJIS[Math.round((selectedLog.moodQuick / 100) * 4)]}</p>
                      <p className="text-xs text-muted-foreground mt-1">Mood</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-2xl">{ENERGY_EMOJIS[Math.round((selectedLog.energyQuick / 100) * 4)]}</p>
                      <p className="text-xs text-muted-foreground mt-1">Energy</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-foreground">{selectedLog.sleepHours}h</p>
                      <p className="text-xs text-muted-foreground mt-1">Sleep</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl p-5 border border-border mb-4">
                  <p className="text-sm text-muted-foreground italic">No log for this day</p>
                </div>
              )}

              {/* Deep log details */}
              {selectedDeep && (
                <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
                  <h4 className="font-semibold text-foreground">Deep Log</h4>
                  
                  {selectedDeep.bloating && (
                    <p className="text-sm text-muted-foreground">🤰 Bloating</p>
                  )}
                  {selectedDeep.headaches && (
                    <p className="text-sm text-muted-foreground">🤕 Headaches</p>
                  )}
                  {selectedDeep.bodyAches && (
                    <p className="text-sm text-muted-foreground">💪 Body Aches</p>
                  )}
                  {selectedDeep.crampsSeverity !== undefined && selectedDeep.crampsSeverity > 0 && (
                    <p className="text-sm text-muted-foreground">
                      😖 Cramps: {selectedDeep.crampsSeverity > 60 ? 'Severe' : selectedDeep.crampsSeverity > 30 ? 'Moderate' : 'Mild'}
                    </p>
                  )}
                  {selectedDeep.flowHeaviness && (
                    <p className="text-sm text-muted-foreground">🩸 Flow: {selectedDeep.flowHeaviness}</p>
                  )}
                  {selectedDeep.spotting && (
                    <p className="text-sm text-muted-foreground">🔴 Spotting</p>
                  )}
                  {selectedDeep.focusConcentration !== undefined && (
                    <p className="text-sm text-muted-foreground">🎯 Focus: {selectedDeep.focusConcentration}/100</p>
                  )}
                  {selectedDeep.sleepQuality && (
                    <p className="text-sm text-muted-foreground">😴 Sleep Quality: {selectedDeep.sleepQuality}</p>
                  )}
                  {selectedDeep.stressLevel !== undefined && (
                    <p className="text-sm text-muted-foreground">😰 Stress: {selectedDeep.stressLevel}/10</p>
                  )}
                  {selectedDeep.notes && (
                    <p className="text-sm text-muted-foreground italic">"{selectedDeep.notes}"</p>
                  )}
                </div>
              )}

              {!selectedDeep && !selectedLog && (
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <p className="text-sm text-muted-foreground italic">No data for this day</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
