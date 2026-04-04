import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
export type FlowHeaviness = 'light' | 'normal' | 'heavy';
export type SleepQuality = 'bad' | 'so-so' | 'good';

export interface UserProfile {
  age: string;
  conditions: string[];
  selectedSymptoms: string[];
  onboardingComplete: boolean;
  hasPeriods: boolean;
  cycleLength?: number;
  periodStartDate?: string;
  periodEndDate?: string;
  reminders: {
    wakeup: string;
    daytime: string;
    evening: string;
    nudge: string;
  };
}

export interface DailyLog {
  date: string;
  moodQuick: number;
  energyQuick: number;
  sleepHours: number;
  phase: Phase;
  timestamp: string;
}

export interface DeepLog {
  date: string;
  focusConcentration?: number;
  bloating?: boolean;
  headaches?: boolean;
  bodyAches?: boolean;
  crampsSeverity?: number;
  flowHeaviness?: FlowHeaviness;
  spotting?: boolean;
  discharge?: string;
  libido?: number;
  acne?: boolean;
  breastTenderness?: boolean;
  sleepQuality?: SleepQuality;
  stressLevel?: number;
  notes?: string;
}

interface TokitoState {
  profile: UserProfile;
  logs: DailyLog[];
  deepLogs: DeepLog[];
  isPeriodActive: boolean;
  periodDates: string[];
  getDeepLog: (date: string) => DeepLog | undefined;
  getLog: (date: string) => DailyLog | undefined;
  getPhaseForDate: (date: string) => Phase;
  setDeepLog: (date: string, data: Partial<{
    focusConcentration?: number;
    bloating?: boolean;
    headaches?: boolean;
    bodyAches?: boolean;
    crampsSeverity?: number;
    flowHeaviness?: FlowHeaviness;
    spotting?: boolean;
    discharge?: string;
    libido?: number;
    acne?: boolean;
    breastTenderness?: boolean;
    sleepQuality?: SleepQuality;
    stressLevel?: number;
    notes?: string;
  }>) => void;
  setProfile: (data: Partial<UserProfile>) => void;
  togglePeriodForDate: (date: string) => void;
  isDateInPeriod: (date: string) => boolean;
  getPeriodStatus: () => boolean;
  clearAllData: () => void;
  addLog: (log: DailyLog) => void;
  startPeriod: string | undefined;
  endPeriod: string | undefined;
}

const defaultProfile: UserProfile = {
  age: '',
  conditions: [],
  selectedSymptoms: ['menstrual', 'mood', 'physical', 'energy', 'hormone'],
  onboardingComplete: false,
  hasPeriods: true,
  reminders: {
    wakeup: '07:00',
    daytime: '14:00',
    evening: '20:00',
    nudge: '08:00',
  },
};

function getPhaseFromCycleDay(day: number, cycleLength: number): Phase {
  if (day <= 5) return 'menstrual';
  if (day <= 12) return 'follicular';
  if (day <= 15) return 'ovulation';
  return 'luteal';
}

export const useStore = create<TokitoState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      logs: [],
      deepLogs: [],
      isPeriodActive: false,
      periodDates: [],
      startPeriod: undefined,
      endPeriod: undefined,

      setProfile: (data) =>
        set((s) => ({ profile: { ...s.profile, ...data } })),

      addLog: (log) =>
        set((s) => {
          const existing = s.logs.findIndex(
            (l) => l.date === log.date
          );
          if (existing >= 0) {
            const updated = [...s.logs];
            updated[existing] = log;
            return { logs: updated };
          }
          return { logs: [...s.logs, log] };
        }),

      updateLog: (date, data) =>
        set((s) => ({
          logs: s.logs.map((l) =>
            l.date === date
              ? { ...l, ...data }
              : l
          ),
        })),

      setDeepLog: (date, data) =>
        set((s) => {
          const existing = s.deepLogs.findIndex((d) => d.date === date);
          if (existing >= 0) {
            const updated = [...s.deepLogs];
            updated[existing] = { ...updated[existing], ...data };
            return { deepLogs: updated };
          }
          return { deepLogs: [...s.deepLogs, { date, ...data }] };
        }),

      getDeepLog: (date) => get().deepLogs.find((d) => d.date === date),

      getLog: (date) =>
        get().logs.find((l) => l.date === date),

      getPhaseForDate: (dateStr) => {
        const { profile, periodDates } = get();
        const target = new Date(dateStr);
        const today = new Date();
        
        // If no period dates logged, default to follicular
        if (periodDates.length === 0) {
          return 'follicular';
        }
        
        // Sort period dates
        const sortedDates = [...periodDates].sort();
        const firstPeriodDate = sortedDates[0];
        
        if (!firstPeriodDate) {
          return 'follicular';
        }
        
        const firstPeriod = new Date(firstPeriodDate);
        const cycleLength = profile.cycleLength || 28;
        
        // Calculate days since first period started
        const daysSincePeriod = Math.floor((target.getTime() - firstPeriod.getTime()) / (1000 * 60 * 60 * 24));
        
        // If date is before first logged period, default to follicular
        if (daysSincePeriod < 0) {
          return 'follicular';
        }
        
        // Calculate position in cycle
        const dayInCycle = (daysSincePeriod % cycleLength) + 1;
        
        // Return phase based on day in cycle
        if (dayInCycle <= 5) return 'menstrual';
        if (dayInCycle <= 13) return 'follicular';
        if (dayInCycle <= 16) return 'ovulation';
        return 'luteal';
      },

      togglePeriodForDate: (date) => {
        const { periodDates, getDeepLog } = get();

        if (periodDates.includes(date)) {
          // Remove from period dates
          const updatedDates = periodDates.filter(d => d !== date);
          set({
            periodDates: updatedDates,
            isPeriodActive: updatedDates.length > 0
          });
        } else {
          // Add to period dates
          const updatedDates = [...periodDates, date];
          set({
            periodDates: updatedDates,
            isPeriodActive: true
          });
          
          // Auto-copy yesterday's deep log settings if period is continuing
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (periodDates.includes(yesterdayStr)) {
            const yesterdayDeep = getDeepLog(yesterdayStr);
            if (yesterdayDeep) {
              const { setDeepLog } = get();
              setDeepLog(date, {
                focusConcentration: yesterdayDeep.focusConcentration,
                bloating: yesterdayDeep.bloating,
                headaches: yesterdayDeep.headaches,
                bodyAches: yesterdayDeep.bodyAches,
                sleepQuality: yesterdayDeep.sleepQuality,
                stressLevel: yesterdayDeep.stressLevel,
                notes: yesterdayDeep.notes
              });
            }
          }
        }
      },

      isDateInPeriod: (date) => {
        const { periodDates } = get();
        return periodDates.includes(date);
      },

      getPeriodStatus: () => {
        const { isPeriodActive } = get();
        return isPeriodActive;
      },

      clearAllData: () =>
        set({
          profile: defaultProfile,
          logs: [],
          deepLogs: [],
          isPeriodActive: false,
          periodDates: [],
          startPeriod: undefined,
          endPeriod: undefined,
        }),
    }),
    { name: 'tokito-store' }
  )
);
