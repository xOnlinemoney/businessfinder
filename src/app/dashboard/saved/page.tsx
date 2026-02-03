import { Metadata } from 'next';
import { SavedListingsContent } from './saved-content';

export const metadata: Metadata = {
  title: 'Saved Listings',
  description: 'View your saved and favorited business listings.',
};

export default function SavedListingsPage() {
  return <SavedListingsContent />;
}
