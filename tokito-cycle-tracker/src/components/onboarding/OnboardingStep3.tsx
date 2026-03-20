import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';

export function OnboardingStep3({ onNext }: { onNext: () => void }) {
  const setProfile = useStore((s) => s.setProfile);

  const handleChoice = (hasPeriods: boolean) => {
    setProfile({ hasPeriods });
    onNext();
  };

  return (
    <div className="space-y-8 text-center">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Do you track your menstrual period?
        </h1>
        <p className="text-muted-foreground mt-2">
          This determines if the period tracker appears on your home screen
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => handleChoice(true)}
          className="h-14 px-10 text-lg font-semibold rounded-full"
        >
          Yes
        </Button>
        <Button
          onClick={() => handleChoice(false)}
          variant="outline"
          className="h-14 px-10 text-lg font-semibold rounded-full"
        >
          No
        </Button>
      </div>
    </div>
  );
}
