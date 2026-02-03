import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | BusinessFinder',
  description: 'Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-dark-900 mb-8">Privacy Policy</h1>
        <p className="text-dark-500 mb-8">Last updated: January 15, 2024</p>

        <div className="prose prose-lg max-w-none text-dark-600">
          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">1. Introduction</h2>
          <p>
            BusinessFinder ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-semibold text-dark-800 mt-6 mb-3">Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name, email address, and phone number</li>
            <li>Company information and job title</li>
            <li>Financial information for transactions</li>
            <li>Business listing information</li>
            <li>Communication preferences</li>
          </ul>

          <h3 className="text-xl font-semibold text-dark-800 mt-6 mb-3">Automatically Collected Information</h3>
          <p>When you access our Platform, we automatically collect:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Device and browser information</li>
            <li>IP address and location data</li>
            <li>Usage patterns and preferences</li>
            <li>Cookies and similar technologies</li>
          </ul>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">3. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain our services</li>
            <li>Process transactions and send related information</li>
            <li>Match buyers with appropriate business listings</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our platform and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">4. Information Sharing</h2>
          <p>We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Other users (as necessary for transactions)</li>
            <li>Service providers who assist our operations</li>
            <li>Legal authorities when required by law</li>
            <li>Business partners (with your consent)</li>
          </ul>
          <p className="mt-4">
            We do not sell your personal information to third parties.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">6. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">7. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our Platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">8. Third-Party Links</h2>
          <p>
            Our Platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">9. Children's Privacy</h2>
          <p>
            Our Platform is not intended for users under the age of 18. We do not knowingly collect personal information from children.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-bold text-dark-900 mt-8 mb-4">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul className="list-none mt-4 space-y-2">
            <li>Email: privacy@businessfinder.com</li>
            <li>Phone: 1-800-123-4567</li>
            <li>Address: 123 Business Ave, Suite 500, New York, NY 10001</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
