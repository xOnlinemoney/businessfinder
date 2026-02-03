'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-dark mb-8">Cookie Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 1, 2024</p>

          <Card className="p-8">
            <div className="prose prose-gray max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-dark mb-4">What Are Cookies</h2>
                <p className="text-gray-600 mb-4">
                  Cookies are small text files that are placed on your computer or mobile device when
                  you visit a website. They are widely used to make websites work more efficiently
                  and provide information to the owners of the site.
                </p>
                <p className="text-gray-600">
                  Cookies allow a website to recognize your device and remember information about
                  your visit, such as your preferred language, login information, and other settings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-dark mb-4">How We Use Cookies</h2>
                <p className="text-gray-600 mb-4">
                  BusinessFinder uses cookies and similar technologies for several purposes:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
                  <li><strong>Performance cookies:</strong> Help us understand how visitors interact with our website</li>
                  <li><strong>Functionality cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Targeting cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-dark mb-4">Types of Cookies We Use</h2>

                <h3 className="text-xl font-semibold text-dark mt-6 mb-3">Essential Cookies</h3>
                <p className="text-gray-600 mb-4">
                  These cookies are necessary for the website to function and cannot be switched off.
                  They are usually only set in response to actions made by you, such as logging in
                  or filling out forms.
                </p>

                <h3 className="text-xl font-semibold text-dark mt-6 mb-3">Analytics Cookies</h3>
                <p className="text-gray-600 mb-4">
                  We use analytics cookies to understand how visitors use our website. This helps us
                  improve the user experience. These cookies collect information in an anonymous form.
                </p>

                <h3 className="text-xl font-semibold text-dark mt-6 mb-3">Preference Cookies</h3>
                <p className="text-gray-600 mb-4">
                  These cookies remember your settings and preferences, such as language preferences
                  and display settings, to provide you with a more personalized experience.
                </p>

                <h3 className="text-xl font-semibold text-dark mt-6 mb-3">Marketing Cookies</h3>
                <p className="text-gray-600 mb-4">
                  These cookies may be set through our site by our advertising partners. They may be
                  used to build a profile of your interests and show you relevant ads on other sites.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-dark mb-4">Third-Party Cookies</h2>
                <p className="text-gray-600 mb-4">
                  In addition to our own cookies, we may also use various third-party cookies to
                  report usage statistics, deliver advertisements, and so forth. These may include:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Google Analytics - for website analytics</li>
                  <li>Google Ads - for advertising</li>
                  <li>Facebook Pixel - for advertising and analytics</li>
                  <li>Intercom - for customer support chat</li>
                  <li>Stripe - for payment processing</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-dark mb-4">Managing Cookies</h2>
                <p className="text-gray-600 mb-4">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>View cookies stored on your computer</li>
                  <li>Delete all or specific cookies</li>
                  <li>Block third-party cookies</li>
                  <li>Block all cookies from specific sites</li>
                  <li>Block all cookies from all sites</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  Please note that if you block or delete cookies, some features of our website
                  may not work properly.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-dark mb-4">Cookie Consent</h2>
                <p className="text-gray-600 mb-4">
                  When you first visit our website, you will see a cookie consent banner. You can
                  choose to accept all cookies, reject non-essential cookies, or customize your
                  preferences.
                </p>
                <p className="text-gray-600">
                  You can change your cookie preferences at any time by clicking on the &quot;Cookie
                  Settings&quot; link in our website footer.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-dark mb-4">Updates to This Policy</h2>
                <p className="text-gray-600">
                  We may update this Cookie Policy from time to time to reflect changes in technology,
                  legislation, or our data practices. Any changes will be posted on this page with
                  an updated revision date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-dark mb-4">Contact Us</h2>
                <p className="text-gray-600">
                  If you have any questions about our use of cookies, please contact us at:
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Email:</strong> privacy@businessfinder.com<br />
                  <strong>Address:</strong> 123 Market Street, Suite 456, San Francisco, CA 94105
                </p>
              </section>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
