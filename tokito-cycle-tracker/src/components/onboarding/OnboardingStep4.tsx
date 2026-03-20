import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function OnboardingStep4({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="space-y-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-7xl"
      >
        🎉
      </motion.div>

      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">You're all set!</h1>
        <p className="text-muted-foreground mt-2">
          Your Tokito profile is ready! Let's start tracking.
        </p>
      </div>

      <Button
        onClick={onFinish}
        className="h-14 px-12 text-lg font-semibold rounded-full"
      >
        Start tracking ✨
      </Button>
    </div>
  );
}
