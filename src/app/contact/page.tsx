'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

const contactMethods = [
  { icon: 'solar:phone-bold', title: 'Phone', value: '1-800-123-4567', description: 'Mon-Fri, 9am-6pm EST', href: 'tel:+18001234567' },
  { icon: 'solar:letter-bold', title: 'Email', value: 'support@businessfinder.com', description: 'We respond within 24 hours', href: 'mailto:support@businessfinder.com' },
  { icon: 'solar:chat-round-dots-bold', title: 'Live Chat', value: 'Start a conversation', description: 'Available 24/7', href: '#' },
];

const inquiryTypes = [
  { value: '', label: 'Select inquiry type' },
  { value: 'buying', label: 'I want to buy a business' },
  { value: 'selling', label: 'I want to sell my business' },
  { value: 'valuation', label: 'I need a business valuation' },
  { value: 'support', label: 'Technical support' },
  { value: 'partnership', label: 'Partnership inquiry' },
  { value: 'other', label: 'Other' },
];

const offices = [
  { city: 'New York', address: '123 Business Ave, Suite 500', phone: '(212) 555-0100' },
  { city: 'San Francisco', address: '456 Market St, Floor 10', phone: '(415) 555-0200' },
  { city: 'London', address: '789 Commerce Lane, W1', phone: '+44 20 7123 4567' },
];

const availableTimes = [
  { value: '', label: 'Select a time slot' },
  { value: 'morning', label: 'Morning (9am - 12pm EST)' },
  { value: 'afternoon', label: 'Afternoon (12pm - 5pm EST)' },
  { value: 'evening', label: 'Evening (5pm - 7pm EST)' },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: '',
  });

  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredTime: '',
    topic: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBookingChange = (field: string, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      inquiryType: '',
      message: '',
    });
  };

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsBooking(false);
    setIsBooked(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-dark-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            Have questions? We&apos;re here to help. Reach out to our team and we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 -mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <a key={method.title} href={method.href}>
                <Card className="text-center hover:border-primary/50 hover:shadow-lg transition-all h-full">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon icon={method.icon} width={28} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-dark-900 mb-1">{method.title}</h3>
                  <p className="text-primary font-medium mb-1">{method.value}</p>
                  <p className="text-sm text-dark-500">{method.description}</p>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-dark-900 mb-4">Send Us a Message</h2>
              <p className="text-dark-600 mb-8">
                Fill out the form and our team will get back to you within 24 hours.
              </p>

              {isSubmitted ? (
                <Card className="text-center py-12 bg-emerald-50 border-emerald-200">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={32} />
                  </div>
                  <h3 className="text-xl font-bold text-dark-900 mb-2">Message Sent!</h3>
                  <p className="text-dark-600 mb-6">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <Button variant="secondary" onClick={() => setIsSubmitted(false)}>
                    Send Another Message
                  </Button>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      required
                    />
                    <Input
                      label="Last Name"
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                  <Select
                    label="What can we help you with?"
                    options={inquiryTypes}
                    value={formData.inquiryType}
                    onChange={(e) => handleChange('inquiryType', e.target.value)}
                    required
                  />
                  <Textarea
                    label="Message"
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    required
                  />
                  <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>

            <div>
              <h2 className="text-3xl font-bold text-dark-900 mb-4">Our Offices</h2>
              <p className="text-dark-600 mb-8">
                Visit us at one of our global offices or schedule a virtual meeting.
              </p>

              <div className="space-y-6">
                {offices.map((office) => (
                  <Card key={office.city}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-dark-100 rounded-lg flex items-center justify-center shrink-0">
                        <Icon icon="solar:map-point-bold" width={20} className="text-dark-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-dark-900">{office.city}</h3>
                        <p className="text-dark-600 text-sm">{office.address}</p>
                        <p className="text-primary text-sm mt-1">{office.phone}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="mt-8 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Icon icon="solar:calendar-bold" width={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-900">Schedule a Call</h3>
                    <p className="text-dark-600 text-sm mb-3">
                      Book a free 30-minute consultation with our M&A advisors.
                    </p>
                    <Button variant="primary" size="sm" onClick={() => setShowBookingModal(true)}>
                      Book a Meeting
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setIsBooked(false);
        }}
        title="Schedule a Consultation"
      >
        {isBooked ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={32} />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">Meeting Booked!</h3>
            <p className="text-dark-600 mb-6">
              You&apos;ll receive a calendar invite at {bookingData.email} shortly.
            </p>
            <Button variant="primary" onClick={() => {
              setShowBookingModal(false);
              setIsBooked(false);
            }}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleBookMeeting} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Smith"
              value={bookingData.name}
              onChange={(e) => handleBookingChange('name', e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={bookingData.email}
              onChange={(e) => handleBookingChange('email', e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="(555) 000-0000"
              value={bookingData.phone}
              onChange={(e) => handleBookingChange('phone', e.target.value)}
            />
            <Select
              label="Preferred Time"
              options={availableTimes}
              value={bookingData.preferredTime}
              onChange={(e) => handleBookingChange('preferredTime', e.target.value)}
              required
            />
            <Textarea
              label="What would you like to discuss?"
              placeholder="Tell us about your goals..."
              rows={3}
              value={bookingData.topic}
              onChange={(e) => handleBookingChange('topic', e.target.value)}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowBookingModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={isBooking}>
                {isBooking ? 'Booking...' : 'Book Meeting'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
