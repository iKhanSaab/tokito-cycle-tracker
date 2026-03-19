import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import tokitoLogo from '@/assets/tokito-logo.png';
import { Button } from '@/components/ui/button';
import { OnboardingStep1 } from './OnboardingStep1';
import { OnboardingStep2 } from './OnboardingStep2';
import { OnboardingStep3 } from './OnboardingStep3';
import { OnboardingStep4 } from './OnboardingStep4';

export function Onboarding() {
  const [step, setStep] = useState(0);
  const setProfile = useStore((s) => s.setProfile);

  const next = () => setStep((s) => Math.min(s + 1, 3));

  const finish = () => {
    setProfile({ onboardingComplete: true });
  };

  const steps = [
    <OnboardingStep1 key={0} onNext={next} />,
    <OnboardingStep2 key={1} onNext={next} />,
    <OnboardingStep3 key={2} onNext={next} />,
    <OnboardingStep4 key={3} onFinish={finish} />,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <motion.img
        src={tokitoLogo}
        alt="Tokito"
        className="w-16 h-16 mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      />
      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === step ? 'bg-primary w-8' : i < step ? 'bg-primary/50' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
