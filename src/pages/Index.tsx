import MandalaGrid from '@/components/MandalaGrid';
import Onboarding, { useOnboarding } from '@/components/Onboarding';
import PlanWizard, { useWizard } from '@/components/PlanWizard';

const Index = () => {
  const { onboardingDone, markOnboardingDone } = useOnboarding();
  const { wizardDone, markWizardDone } = useWizard();

  if (!onboardingDone) {
    return <Onboarding onComplete={markOnboardingDone} />;
  }

  if (!wizardDone) {
    return <PlanWizard onComplete={markWizardDone} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-6">
      <MandalaGrid />
    </div>
  );
};

export default Index;
