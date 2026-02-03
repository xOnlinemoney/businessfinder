import { Metadata } from 'next';
import { OnboardingContent } from './onboarding-content';

export const metadata: Metadata = {
  title: 'Seller Onboarding',
  description: 'List your business for sale on BusinessFinder.',
};

export default function OnboardingPage() {
  return <OnboardingContent />;
}
