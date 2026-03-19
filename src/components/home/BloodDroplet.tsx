import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

export function BloodDroplet() {
  const { profile, isPeriodActive, startPeriod, endPeriod } = useStore();
  const [showDialog, setShowDialog] = useState(false);

  if (!profile.hasPeriods) return null;

  const handleTap = () => setShowDialog(true);

  const handleConfirm = () => {
    if (isPeriodActive) {
      endPeriod();
    } else {
      startPeriod();
    }
    setShowDialog(false);
  };

  return (
    <>
      <motion.button
        onClick={handleTap}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${
          isPeriodActive
            ? 'bg-droplet-active'
            : 'bg-droplet-inactive/20'
        }`}
      >
        <span className="text-2xl">🩸</span>
      </motion.button>

      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl"
            >
              <p className="text-4xl">🩸</p>
              <h3 className="text-lg font-bold font-heading text-foreground">
                {isPeriodActive ? 'End period?' : 'Period started?'}
              </h3>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleConfirm}
                  className="pill-btn pill-btn-active"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDialog(false)}
                  className="pill-btn"
                >
                  {isPeriodActive ? 'Cancel' : 'No'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
