import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const CONDITIONS = ['PCOS', 'Thyroid', 'Endometriosis', 'None', 'Prefer not to say'];
const SYMPTOMS = [
  { key: 'menstrual', label: 'Menstrual symptoms' },
  { key: 'mood', label: 'Mood' },
  { key: 'physical', label: 'Physical' },
  { key: 'energy', label: 'Energy/sleep quality' },
  { key: 'hormone', label: 'Hormone-specific' },
];

export function SettingsPage() {
  const { profile, setProfile, clearAllData } = useStore();
  const [cycleLength, setCycleLength] = useState(profile.cycleLength);
  const [conditions, setConditions] = useState(profile.conditions);
  const [symptoms, setSymptoms] = useState(profile.selectedSymptoms);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [reminders, setReminders] = useState(profile.reminders);

  const toggleCondition = (c: string) => {
    if (c === 'None' || c === 'Prefer not to say') {
      setConditions([c]);
    } else {
      setConditions((prev) =>
        prev.includes(c) ? prev.filter((x) => x !== c) : [...prev.filter((x) => x !== 'None' && x !== 'Prefer not to say'), c]
      );
    }
  };

  const toggleSymptom = (key: string) => {
    setSymptoms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const saveSettings = () => {
    setProfile({
      cycleLength,
      conditions,
      selectedSymptoms: symptoms,
      reminders,
    });
    toast({ title: '✓ Settings saved', duration: 2000 });
  };

  const handleClear = () => {
    clearAllData();
    setShowClearConfirm(false);
    toast({ title: 'All data cleared', duration: 2000 });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold font-heading text-foreground">Settings</h1>

        {/* Profile */}
        <Section title="Profile">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Cycle Length: {cycleLength} days</label>
              <input type="range" min={20} max={45} value={cycleLength} onChange={(e) => setCycleLength(Number(e.target.value))} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Conditions</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {CONDITIONS.map((c) => (
                  <button key={c} onClick={() => toggleCondition(c)} className={`pill-btn text-xs ${conditions.includes(c) ? 'pill-btn-active' : ''}`}>{c}</button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Tracking */}
        <Section title="Tracking Preferences">
          <div className="space-y-2">
            {SYMPTOMS.map((s) => (
              <button
                key={s.key}
                onClick={() => toggleSymptom(s.key)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm ${
                  symptoms.includes(s.key) ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${symptoms.includes(s.key) ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                    {symptoms.includes(s.key) && <span className="text-primary-foreground text-[10px]">✓</span>}
                  </div>
                  {s.label}
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Reminders */}
        <Section title="Reminders">
          <div className="space-y-3">
            {([
              { key: 'morning' as const, label: 'Morning reminder' },
              { key: 'evening' as const, label: 'Evening reminder' },
            ]).map((r) => (
              <div key={r.key} className="flex items-center justify-between">
                <label className="text-sm text-foreground">{r.label}</label>
                <input
                  type="time"
                  value={reminders[r.key]}
                  onChange={(e) => setReminders((prev) => ({ ...prev, [r.key]: e.target.value }))}
                  className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
                />
              </div>
            ))}
          </div>
        </Section>

        <Button onClick={saveSettings} className="w-full h-12 rounded-full text-base font-semibold">
          Save Settings
        </Button>

        {/* Data */}
        <Section title="Data">
          {showClearConfirm ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive font-medium">⚠️ This will delete all your data. Are you sure?</p>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleClear} className="rounded-full">Yes, clear everything</Button>
                <Button variant="outline" onClick={() => setShowClearConfirm(false)} className="rounded-full">Cancel</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowClearConfirm(true)} className="rounded-full text-destructive">
              Clear All Data
            </Button>
          )}
        </Section>

        {/* About */}
        <Section title="About">
          <p className="text-sm text-muted-foreground">Tokito v1.0.0</p>
          <p className="text-sm text-muted-foreground">Track your cycle. Understand your body.</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <h2 className="text-base font-bold font-heading text-foreground">{title}</h2>
      {children}
    </div>
  );
}
