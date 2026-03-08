import MandalaGrid from '@/components/MandalaGrid';
import Onboarding, { useOnboarding } from '@/components/Onboarding';

const Index = () => {
  const { onboardingDone, markOnboardingDone } = useOnboarding();

  if (!onboardingDone) {
    return <Onboarding onComplete={markOnboardingDone} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-6">
      <MandalaGrid />
    </div>
  );
};

export default Index;
