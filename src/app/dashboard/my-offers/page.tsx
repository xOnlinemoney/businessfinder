import { Metadata } from 'next';
import { MyOffersContent } from './my-offers-content';

export const metadata: Metadata = {
  title: 'My Offers',
  description: 'Track offers you have made on business listings.',
};

export default function MyOffersPage() {
  return <MyOffersContent />;
}
