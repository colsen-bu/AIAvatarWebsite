"use client";

import React, { useState } from "react";
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    meetingType: '',
    date: '',
    overallImpression: '',
    strengths: '',
    areasForImprovement: '',
    additionalComments: '',
    wouldRecommend: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  React.useEffect(() => {
    document.title = "Feedback - Christopher Olsen";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Submit feedback for Christopher Olsen after an interview, meeting, or collaboration.'
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    // Validate required field
    if (!formData.overallImpression) {
      setSubmitStatus({
        type: 'error',
        message: 'Please provide an overall impression rating.'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/feedback', {
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
          message: result.message || 'Thank you for your feedback! I truly appreciate you taking the time.'
        });
        setFormData({
          name: '',
          email: '',
          company: '',
          meetingType: '',
          date: '',
          overallImpression: '',
          strengths: '',
          areasForImprovement: '',
          additionalComments: '',
          wouldRecommend: ''
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'There was an error submitting your feedback. Please try again.'
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

  const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-2xl mx-auto">
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

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Feedback Form
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you for taking the time to share your thoughts. Your feedback helps me grow and improve. All responses are confidential.
          </p>
        </div>

        {/* Success/Error Message */}
        {submitStatus.type && (
          <div
            className={cn(
              "mb-6 p-4 rounded-lg",
              submitStatus.type === 'success'
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
            )}
          >
            {submitStatus.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Info Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className={labelClasses}>
                  Name <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={inputClasses}
                />
              </div>
              
              <div>
                <label htmlFor="email" className={labelClasses}>
                  Email <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company" className={labelClasses}>
                  Company / Organization <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company name"
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="date" className={labelClasses}>
                  Date of Meeting <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="meetingType" className={labelClasses}>
                Type of Interaction <span className="text-gray-400">(optional)</span>
              </label>
              <select
                id="meetingType"
                name="meetingType"
                value={formData.meetingType}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="">Select type...</option>
                <option value="phone-screen">Phone Screen</option>
                <option value="technical-interview">Technical Interview</option>
                <option value="behavioral-interview">Behavioral Interview</option>
                <option value="panel-interview">Panel Interview</option>
                <option value="informational">Informational Meeting</option>
                <option value="networking">Networking Event</option>
                <option value="collaboration">Project Collaboration</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Feedback</h2>

            <div>
              <label htmlFor="overallImpression" className={labelClasses}>
                Overall Impression <span className="text-red-500">*</span>
              </label>
              <select
                id="overallImpression"
                name="overallImpression"
                value={formData.overallImpression}
                onChange={handleChange}
                required
                className={inputClasses}
              >
                <option value="">Select rating...</option>
                <option value="excellent">Excellent - Exceeded expectations</option>
                <option value="good">Good - Met expectations</option>
                <option value="average">Average - Some areas need work</option>
                <option value="below-average">Below Average - Needs significant improvement</option>
              </select>
            </div>

            <div>
              <label htmlFor="strengths" className={labelClasses}>
                What were my strengths? <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id="strengths"
                name="strengths"
                value={formData.strengths}
                onChange={handleChange}
                rows={3}
                placeholder="What stood out positively? (e.g., communication, technical knowledge, problem-solving...)"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="areasForImprovement" className={labelClasses}>
                Areas for Improvement <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id="areasForImprovement"
                name="areasForImprovement"
                value={formData.areasForImprovement}
                onChange={handleChange}
                rows={3}
                placeholder="What could I do better? Be candid - honest feedback is most helpful."
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="additionalComments" className={labelClasses}>
                Additional Comments <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id="additionalComments"
                name="additionalComments"
                value={formData.additionalComments}
                onChange={handleChange}
                rows={3}
                placeholder="Any other thoughts, advice, or observations..."
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="wouldRecommend" className={labelClasses}>
                Would you recommend me to a colleague? <span className="text-gray-400">(optional)</span>
              </label>
              <select
                id="wouldRecommend"
                name="wouldRecommend"
                value={formData.wouldRecommend}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="">Select...</option>
                <option value="definitely">Definitely yes</option>
                <option value="probably">Probably yes</option>
                <option value="unsure">Not sure</option>
                <option value="probably-not">Probably not</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full py-4 px-6 rounded-lg font-medium text-white transition-all",
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Feedback"
            )}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Your feedback is confidential and will only be used for my personal development.
          </p>
        </form>
      </div>
    </div>
  );
}
