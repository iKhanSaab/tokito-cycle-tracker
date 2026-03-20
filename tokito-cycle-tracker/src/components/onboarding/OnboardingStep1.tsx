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
  const [conditions, setConditions] = useState<string[]>([]);
  const [periodStartDate, setPeriodStartDate] = useState<Date | undefined>();
  const [periodEndDate, setPeriodEndDate] = useState<Date | undefined>();

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
      conditions,
      periodStartDate: periodStartDate ? format(periodStartDate, 'yyyy-MM-dd') : undefined,
      periodEndDate: periodEndDate ? format(periodEndDate, 'yyyy-MM-dd') : undefined,
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
        <div className="flex gap-1">
          {AGE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setAge(opt)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-all border-2 border-border ${
                age === opt 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card text-muted-foreground hover:border-primary/50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Period Dates */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Last period dates (optional)</label>
        <div className="grid grid-cols-2 gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !periodStartDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {periodStartDate ? format(periodStartDate, "PPP") : <span>Start date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={periodStartDate}
                onSelect={setPeriodStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !periodEndDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {periodEndDate ? format(periodEndDate, "PPP") : <span>End date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={periodEndDate}
                onSelect={setPeriodEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
