import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const SYMPTOM_PILLS = [
  { key: 'bloating', label: 'Bloated' },
  { key: 'headaches', label: 'Headaches' },
  { key: 'bodyAches', label: 'Body Aches' },
] as const;

const DISCHARGE_OPTIONS = ['None', 'Clear', 'White', 'Yellow', 'Brown'];
const LIBIDO_OPTIONS = ['Low', 'Medium', 'High'];

export function DeepLogSection() {
  const today = new Date().toISOString().split('T')[0];
  const { setDeepLog, getDeepLog, isPeriodActive, profile, isDateInPeriod } = useStore();
  const existing = getDeepLog(today);
  const isCurrentlyInPeriod = isDateInPeriod(today);

  const [focus, setFocus] = useState(existing?.focusConcentration ?? 50);
  const [symptoms, setSymptoms] = useState({
    bloating: existing?.bloating ?? false,
    headaches: existing?.headaches ?? false,
    bodyAches: existing?.bodyAches ?? false,
    crampsSeverity: existing?.crampsSeverity ?? 0,
  });
  const [periodQuestions, setPeriodQuestions] = useState({
    flowHeaviness: existing?.flowHeaviness ?? undefined,
    spotting: existing?.spotting ?? false,
    discharge: existing?.discharge ?? undefined,
    libido: existing?.libido ?? 5,
  });
  const [sleepQuality, setSleepQuality] = useState(existing?.sleepQuality ?? undefined);
  const [stress, setStress] = useState(existing?.stressLevel ?? 5);
  const [notes, setNotes] = useState(existing?.notes ?? '');

  // Auto-add period-specific questions when period starts and user tracks periods
  useEffect(() => {
    if (isCurrentlyInPeriod && !existing && profile.hasPeriods) {
      handlePeriodStart();
    }
  }, [isCurrentlyInPeriod, existing, profile.hasPeriods]);

  const save = (data: Partial<{
    focusConcentration?: number;
    bloating?: boolean;
    headaches?: boolean;
    bodyAches?: boolean;
    crampsSeverity?: number;
    flowHeaviness?: 'light' | 'normal' | 'heavy';
    spotting?: boolean;
    discharge?: string;
    libido?: number;
    acne?: boolean;
    breastTenderness?: boolean;
    sleepQuality?: 'bad' | 'so-so' | 'good';
    stressLevel?: number;
    notes?: string;
  }>) => {
    setDeepLog(today, data);
  };

  const handleSave = () => {
    setDeepLog(today, {
      focusConcentration: focus,
      bloating: symptoms.bloating,
      headaches: symptoms.headaches,
      bodyAches: symptoms.bodyAches,
      crampsSeverity: symptoms.crampsSeverity,
      flowHeaviness: periodQuestions.flowHeaviness,
      spotting: periodQuestions.spotting,
      discharge: periodQuestions.discharge,
      libido: periodQuestions.libido,
      sleepQuality,
      stressLevel: stress,
      notes,
    });
    toast({ title: '✓ Saved', duration: 1500 });
  };

  const toggleSymptom = (key: keyof typeof symptoms) => {
    setSymptoms(prev => {
      const newSymptoms = { ...prev, [key]: !prev[key] };
      save(newSymptoms);
      return newSymptoms;
    });
  };

  const updateCramps = (severity: number) => {
    setSymptoms(prev => {
      const newSymptoms = { ...prev, crampsSeverity: severity };
      save(newSymptoms);
      return newSymptoms;
    });
  };

  const updatePeriodQuestion = (key: keyof typeof periodQuestions, value: any) => {
    setPeriodQuestions(prev => {
      const newQuestions = { ...prev, [key]: value };
      save(newQuestions);
      return newQuestions;
    });
  };

  // Auto-add period-specific questions when period starts
  const handlePeriodStart = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if yesterday had period active
    const yesterdayDeep = getDeepLog(yesterdayStr);
    if (yesterdayDeep) {
      // Copy yesterday's symptoms to today, but reset period-specific questions
      setDeepLog(today, {
        focusConcentration: yesterdayDeep.focusConcentration,
        bloating: yesterdayDeep.bloating,
        headaches: yesterdayDeep.headaches,
        bodyAches: yesterdayDeep.bodyAches,
        crampsSeverity: yesterdayDeep.crampsSeverity,
        flowHeaviness: undefined, // Reset period-specific questions
        spotting: undefined,
        discharge: undefined,
        libido: undefined,
        sleepQuality: yesterdayDeep.sleepQuality,
        stressLevel: yesterdayDeep.stressLevel,
        notes: yesterdayDeep.notes
      });
      
      // Update local state to reflect the changes
      setSymptoms({
        bloating: yesterdayDeep.bloating ?? false,
        headaches: yesterdayDeep.headaches ?? false,
        bodyAches: yesterdayDeep.bodyAches ?? false,
        crampsSeverity: yesterdayDeep.crampsSeverity ?? 0,
      });
      setPeriodQuestions({
        flowHeaviness: undefined, // Reset period-specific questions
        spotting: undefined,
        discharge: undefined,
        libido: undefined,
      });
      setFocus(yesterdayDeep.focusConcentration ?? 50);
      setSleepQuality(yesterdayDeep.sleepQuality);
      setStress(yesterdayDeep.stressLevel ?? 5);
      setNotes(yesterdayDeep.notes ?? '');
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      {/* Cramps - only during period */}
      {profile.hasPeriods && isCurrentlyInPeriod && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Cramps</p>
          <input
            type="range"
            min={0}
            max={100}
            value={symptoms.crampsSeverity}
            onChange={(e) => updateCramps(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>No cramps</span>
            <span>Severe cramps</span>
          </div>
        </div>
      )}

      {/* Flow heaviness - only during period */}
      {profile.hasPeriods && isCurrentlyInPeriod && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Flow heaviness</p>
          <div className="flex gap-2">
            {(['light', 'normal', 'heavy'] as const).map((flow) => (
              <button
                key={flow}
                onClick={() => updatePeriodQuestion('flowHeaviness', flow)}
                className={`flex-1 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  periodQuestions.flowHeaviness === flow 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {flow}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms - shown at both times */}
      {profile.hasPeriods && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Symptoms</p>
          <div className="flex gap-2">
            {SYMPTOM_PILLS.map((pill) => (
              <button
                key={pill.key}
                onClick={() => toggleSymptom(pill.key as keyof typeof symptoms)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                  symptoms[pill.key as keyof typeof symptoms] 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Libido - shown at both times */}
      {profile.hasPeriods && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Libido</p>
          <div className="flex gap-2">
            {LIBIDO_OPTIONS.map((libido) => (
              <button
                key={libido}
                onClick={() => updatePeriodQuestion('libido', LIBIDO_OPTIONS.indexOf(libido) + 1)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                  periodQuestions.libido === LIBIDO_OPTIONS.indexOf(libido) + 1 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {libido}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spotting - only when NOT in period */}
      {profile.hasPeriods && !isCurrentlyInPeriod && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Spotting</p>
          <div className="flex gap-3">
            {[true, false].map((v) => (
              <button 
                key={String(v)} 
                onClick={() => updatePeriodQuestion('spotting', v)}
                className={`pill-btn ${periodQuestions.spotting === v ? 'pill-btn-active' : ''}`}
              >
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Discharge - only when NOT in period */}
      {profile.hasPeriods && !isCurrentlyInPeriod && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Discharge</p>
          <div className="flex gap-2 flex-wrap">
            {DISCHARGE_OPTIONS.map((discharge) => (
              <button
                key={discharge}
                onClick={() => updatePeriodQuestion('discharge', discharge)}
                className={`pill-btn ${periodQuestions.discharge === discharge ? 'pill-btn-active' : ''}`}
              >
                {discharge}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Focus - always available */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Focus</p>
        <input
          type="range"
          min={0}
          max={100}
          value={focus}
          onChange={(e) => { setFocus(Number(e.target.value)); save({ focusConcentration: Number(e.target.value) }); }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Sleep quality - always available */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Sleep Quality</p>
        <div className="flex gap-2">
          {(['bad', 'so-so', 'good'] as const).map((q) => (
            <button
              key={q}
              onClick={() => { setSleepQuality(q); save({ sleepQuality: q }); }}
              className={`flex-1 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                sleepQuality === q 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {q === 'so-so' ? 'So-so' : q.charAt(0).toUpperCase() + q.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stress - always available */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Stress</p>
        <input
          type="range"
          min={0}
          max={10}
          value={stress}
          onChange={(e) => { setStress(Number(e.target.value)); save({ stressLevel: Number(e.target.value) }); }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>10</span>
        </div>
      </div>

      {/* Notes - always available */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Notes</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => save({ notes })}
          placeholder="Any notes..."
          className="w-full p-3 rounded-xl border border-border bg-background text-foreground resize-none h-16 text-sm"
        />
      </div>

      {/* Save button */}
      <Button onClick={handleSave} className="w-full h-10 rounded-full text-sm font-medium">
        Save Deep Log
      </Button>
    </div>
  );
}
