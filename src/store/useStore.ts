import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
export type SnapshotType = 'morning' | 'afternoon' | 'evening';
export type FlowHeaviness = 'light' | 'normal' | 'heavy';
export type SleepQuality = 'bad' | 'so-so' | 'good';

export interface UserProfile {
  age: string;
  lastPeriodDate: string;
  cycleLength: number;
  conditions: string[];
  selectedSymptoms: string[];
  hasPeriods: boolean;
  onboardingComplete: boolean;
  reminders: {
    wakeup: string;
    daytime: string;
    evening: string;
    nudge: string;
  };
}

export interface DailyLog {
  date: string;
  snapshotType: SnapshotType;
  moodQuick: number;
  energyQuick: number;
  sleepHours: number;
  phase: Phase;
  timestamp: string;
}

export interface DeepLog {
  date: string;
  spotting?: boolean;
  crampsSeverity?: number;
  flowHeaviness?: FlowHeaviness | null;
  moodDetailed?: number;
  focusConcentration?: number;
  bloating?: boolean;
  headaches?: boolean;
  bodyAches?: boolean;
  sleepQuality?: SleepQuality;
  stressLevel?: number;
  notes?: string;
}

export interface PeriodEntry {
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

interface TokitoState {
  profile: UserProfile;
  logs: DailyLog[];
  deepLogs: DeepLog[];
  periods: PeriodEntry[];
  isPeriodActive: boolean;

  setProfile: (profile: Partial<UserProfile>) => void;
  addLog: (log: DailyLog) => void;
  updateLog: (date: string, snapshotType: SnapshotType, data: Partial<DailyLog>) => void;
  setDeepLog: (date: string, data: Partial<DeepLog>) => void;
  getDeepLog: (date: string) => DeepLog | undefined;
  getLog: (date: string, snapshotType?: SnapshotType) => DailyLog | undefined;
  startPeriod: () => void;
  endPeriod: () => void;
  getPhaseForDate: (date: string) => Phase;
  clearAllData: () => void;
}

const defaultProfile: UserProfile = {
  age: '',
  lastPeriodDate: '',
  cycleLength: 28,
  conditions: [],
  selectedSymptoms: ['menstrual', 'mood', 'physical', 'energy', 'hormone'],
  hasPeriods: true,
  onboardingComplete: false,
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
      periods: [],
      isPeriodActive: false,

      setProfile: (data) =>
        set((s) => ({ profile: { ...s.profile, ...data } })),

      addLog: (log) =>
        set((s) => {
          const existing = s.logs.findIndex(
            (l) => l.date === log.date && l.snapshotType === log.snapshotType
          );
          if (existing >= 0) {
            const updated = [...s.logs];
            updated[existing] = log;
            return { logs: updated };
          }
          return { logs: [...s.logs, log] };
        }),

      updateLog: (date, snapshotType, data) =>
        set((s) => ({
          logs: s.logs.map((l) =>
            l.date === date && l.snapshotType === snapshotType
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

      getLog: (date, snapshotType) =>
        get().logs.find(
          (l) => l.date === date && (!snapshotType || l.snapshotType === snapshotType)
        ),

      startPeriod: () =>
        set((s) => ({
          isPeriodActive: true,
          periods: [
            ...s.periods,
            {
              startDate: new Date().toISOString().split('T')[0],
              endDate: null,
              isActive: true,
            },
          ],
        })),

      endPeriod: () =>
        set((s) => ({
          isPeriodActive: false,
          periods: s.periods.map((p) =>
            p.isActive
              ? { ...p, endDate: new Date().toISOString().split('T')[0], isActive: false }
              : p
          ),
        })),

      getPhaseForDate: (dateStr) => {
        const { profile } = get();
        if (!profile.lastPeriodDate) return 'follicular';
        const lastPeriod = new Date(profile.lastPeriodDate);
        const target = new Date(dateStr);
        const diffDays = Math.floor(
          (target.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
        );
        const cycleDay = ((diffDays % profile.cycleLength) + profile.cycleLength) % profile.cycleLength + 1;
        return getPhaseFromCycleDay(cycleDay, profile.cycleLength);
      },

      clearAllData: () =>
        set({
          profile: defaultProfile,
          logs: [],
          deepLogs: [],
          periods: [],
          isPeriodActive: false,
        }),
    }),
    { name: 'tokito-store' }
  )
);
