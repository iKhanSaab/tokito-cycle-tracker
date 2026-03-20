import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { HomeScreen } from '@/components/home/HomeScreen';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { Home, User } from 'lucide-react';

type Tab = 'home' | 'profile';

const Index = () => {
  const onboardingComplete = useStore((s) => s.profile.onboardingComplete);
  const [tab, setTab] = useState<Tab>('home');

  if (!onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      {tab === 'home' && <HomeScreen />}
      {tab === 'profile' && <SettingsPage />}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30">
        <div className="max-w-md mx-auto flex">
          {([
            { key: 'home' as const, icon: Home, label: 'Home' },
            { key: 'profile' as const, icon: User, label: 'Profile' },
          ]).map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                tab === item.key ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
