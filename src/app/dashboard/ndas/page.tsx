import { Metadata } from 'next';
import { NDAsContent } from './ndas-content';

export const metadata: Metadata = {
  title: 'NDAs Signed',
  description: 'View all non-disclosure agreements you have signed.',
};

export default function NDAsPage() {
  return <NDAsContent />;
}
