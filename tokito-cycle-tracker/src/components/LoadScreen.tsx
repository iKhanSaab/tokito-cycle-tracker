import { useEffect } from 'react';

interface LoadScreenProps {
  onComplete: () => void;
}

export function LoadScreen({ onComplete }: LoadScreenProps) {
  useEffect(() => {
    // Duration of the load screen video in milliseconds
    // Adjust this based on your video length
    const loadDuration = 3000;

    const timer = setTimeout(() => {
      onComplete();
    }, loadDuration);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <img
        src="/tokito-load-screen.gif"
        alt="Loading"
        className="w-full h-full object-contain"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}
