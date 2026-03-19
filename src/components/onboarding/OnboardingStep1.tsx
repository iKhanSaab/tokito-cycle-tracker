import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const AGE_OPTIONS = ['<18', '18-24', '25-34', '35-44', '45+'];
const CONDITIONS = ['PCOS', 'Thyroid', 'Endometriosis', 'None', 'Prefer not to say'];

export function OnboardingStep1({ onNext }: { onNext: () => void }) {
  const setProfile = useStore((s) => s.setProfile);
  const [age, setAge] = useState('');
  const [lastPeriod, setLastPeriod] = useState<Date>();
  const [cycleLength, setCycleLength] = useState(28);
  const [conditions, setConditions] = useState<string[]>([]);

  const toggleCondition = (c: string) => {
    if (c === 'None' || c === 'Prefer not to say') {
      setConditions([c]);
    } else {
      setConditions((prev) =>
        prev.includes(c)
          ? prev.filter((x) => x !== c)
          : [...prev.filter((x) => x !== 'None' && x !== 'Prefer not to say'), c]
      );
    }
  };

  const handleContinue = () => {
    setProfile({
      age,
      lastPeriodDate: lastPeriod ? format(lastPeriod, 'yyyy-MM-dd') : '',
      cycleLength,
      conditions,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-heading text-foreground">Tell us about you</h1>
        <p className="text-muted-foreground mt-1">This helps us personalize your experience</p>
      </div>

      {/* Age */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Age range</label>
        <div className="flex flex-wrap gap-2">
          {AGE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setAge(opt)}
              className={`pill-btn ${age === opt ? 'pill-btn-active' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Last period date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Last period start date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !lastPeriod && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {lastPeriod ? format(lastPeriod, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={lastPeriod}
              onSelect={setLastPeriod}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Cycle length */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Cycle length (days): <span className="font-bold text-primary">{cycleLength}</span>
        </label>
        <input
          type="range"
          min={20}
          max={45}
          value={cycleLength}
          onChange={(e) => setCycleLength(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>20</span>
          <span>45</span>
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Known conditions</label>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              onClick={() => toggleCondition(c)}
              className={`pill-btn ${conditions.includes(c) ? 'pill-btn-active' : ''}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleContinue} className="w-full h-12 text-base font-semibold rounded-full">
        Continue
      </Button>
    </div>
  );
}
