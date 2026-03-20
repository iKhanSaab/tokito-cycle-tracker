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
        const { profile } = get();
        const target = new Date(dateStr);
        
        // Default to follicular if no period data
        return 'follicular';
      },

      togglePeriodForDate: (date) => {
        const { periodDates, isPeriodActive, getDeepLog } = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (date !== today) return;

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
