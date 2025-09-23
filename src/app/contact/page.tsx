"use client";

import React, { useState } from "react";
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Since this is a client component, we'll handle metadata via useEffect
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Handle metadata for client component
  React.useEffect(() => {
    document.title = "Contact - Christopher Olsen | Get in Touch";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Contact Christopher Olsen (Chris Olsen) - Cell & Biochemical Assay Scientist. Send a message or schedule a meeting to discuss biotech projects, collaborations, or opportunities.'
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Thank you for your message! I\'ll get back to you soon.'
        });
        // Clear form on success
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'There was an error sending your message. Please try again.'
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            back
          </Link>
        </div>

        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Contact</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Let's connect! Send me a message or schedule a meeting to discuss opportunities, collaborations, or just to say hello.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Send a Message</h2>
            
            {/* Status Messages */}
            {submitStatus.type && (
              <div className={cn(
                "mb-6 p-4 rounded-lg border",
                submitStatus.type === 'success' 
                  ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
                  : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
              )}>
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="What would you like to discuss?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  minLength={10}
                  maxLength={2000}
                  disabled={isSubmitting}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed resize-vertical"
                  placeholder="Your message..."
                />
                <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.message.length}/2000 characters
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full py-3 px-6 rounded-md font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                  isSubmitting
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Calendly Embed */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Schedule a Meeting</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Prefer to talk in person? Schedule a 30-minute meeting to discuss your project or opportunity.
            </p>
            
            {/* Calendly Inline Widget */}
            <div className="calendly-inline-widget h-[600px] w-full rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
              <iframe
                src="https://calendly.com/colsen-mcvcllmhgb/30min"
                width="100%"
                height="100%"
                frameBorder="0"
                title="Schedule a meeting with Christopher Olsen"
                className="rounded-lg"
              />
            </div>
            
            {/* Fallback link */}
            <div className="mt-4 text-center">
              <a
                href="https://calendly.com/colsen-mcvcllmhgb/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors text-sm"
              >
                Open in new window →
              </a>
            </div>
          </div>
        </div>

        {/* Additional Contact Information */}
        <div className="mt-16 text-center border-t border-gray-200 dark:border-gray-800 pt-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Other Ways to Connect</h3>
          <div className="flex justify-center gap-6 text-sm">
            <a
              href="mailto:colsen@mcvcllmhgb.com"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
            >
              colsen@mcvcllmhgb.com
            </a>
            <a
              href="tel:617-922-9615"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
            >
              (617) 922-9615
            </a>
            <a
              href="https://linkedin.com/in/colsen-bu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}