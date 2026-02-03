import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Terms of Service | BusinessFinder',
  description: 'Read our terms of service and user agreement.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-dark-900 mb-8">Terms of Service</h1>
        <p className="text-dark-500 mb-8">Last updated: January 15, 2024</p>

        <div className="prose prose-lg max-w-none text-dark-600">
          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using BusinessFinder ("Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">2. Description of Service</h2>
          <p>
            BusinessFinder provides an online marketplace platform that connects business sellers with potential buyers. Our services include business listings, valuations, buyer matching, deal advisory, and transaction support.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">3. User Registration</h2>
          <p>
            To access certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">4. Confidentiality</h2>
          <p>
            Users must sign a Non-Disclosure Agreement (NDA) before accessing confidential business information. You agree to maintain the confidentiality of all non-public information shared through the Platform.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">5. Listing Requirements</h2>
          <p>
            Sellers must provide accurate and truthful information about their businesses. BusinessFinder reserves the right to remove any listing that contains false or misleading information.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">6. Fees and Payments</h2>
          <p>
            Our fee structure is success-based for sellers, meaning fees are only charged upon successful completion of a transaction. Specific fee percentages will be disclosed before listing. Buyers may use the platform at no cost.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">7. Limitation of Liability</h2>
          <p>
            BusinessFinder acts as an intermediary and does not guarantee the accuracy of information provided by users. We are not liable for any damages resulting from transactions conducted through our Platform.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">8. Intellectual Property</h2>
          <p>
            All content on the Platform, including text, graphics, logos, and software, is the property of BusinessFinder or its content suppliers and is protected by intellectual property laws.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">9. Termination</h2>
          <p>
            BusinessFinder reserves the right to terminate or suspend your account at any time for violations of these terms or for any other reason at our sole discretion.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or through the Platform. Continued use after changes constitutes acceptance.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">11. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at legal@businessfinder.com.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
