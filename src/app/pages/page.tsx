"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import presentations from '../../../data/presentations.json';
import type { Presentation } from '../../types/presentations';

interface Page {
  name: string;
  slug: string;
  description: string;
  icon: string;
  previewSrc: string;
}

const pages: Page[] = [
  {
    name: 'Invoice Generator',
    slug: 'invoicer',
    description: 'Create professional invoices quickly and easily',
    icon: '📄',
    previewSrc: '/pages/invoicer/app.html',
  },
  {
    name: 'Investment Overview',
    slug: 'investment',
    description: 'Vanguard Roth IRA portfolio allocation and expense ratio analysis',
    icon: '📊',
    previewSrc: '/pages/investment/app.html',
  },
  {
    name: 'Portland ME Trip Planner',
    slug: 'portland-trip',
    description: 'Plan your perfect coastal getaway to Portland, Maine',
    icon: '🦞',
    previewSrc: '/pages/portland-trip/app.html',
  },
  {
    name: 'Cape Rental Rate Analysis',
    slug: 'cape-rental',
    description: 'Market analysis and pricing tool for Cape Cod rental property',
    icon: '🏠',
    previewSrc: '/pages/cape-rental/app.html',
  },
  {
    name: 'Blood on the Clocktower Grimoire',
    slug: 'botc',
    description: 'Storyteller companion app for Blood on the Clocktower',
    icon: '🩸',
    previewSrc: '/pages/botc/app.html',
  },
];

export default function PagesLandingPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/pages/auth', { method: 'DELETE' });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              📄 Pages & Apps
            </h1>
            <p className="text-white/80">
              Personal utility applications
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              ← Back to Site
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Link
              key={page.slug}
              href={`/pages/${page.slug}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Preview iframe container */}
              <div className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <iframe
                  src={page.previewSrc}
                  className="w-[200%] h-[200%] origin-top-left scale-50 pointer-events-none"
                  title={`${page.name} preview`}
                  loading="lazy"
                />
                {/* Overlay to prevent interaction and add hover effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{page.icon}</span>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {page.name}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {page.description}
                </p>
                <div className="mt-3 text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open App →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Presentations Section */}
        {(presentations as Presentation[]).length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-white mt-12 mb-6">
              🎯 Presentations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(presentations as Presentation[]).map((pres) => (
                <Link
                  key={pres.slug}
                  href={`/pages/presentations/${pres.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Preview placeholder for presentations */}
                  <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                    <span className="text-6xl">{pres.icon}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{pres.icon}</span>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {pres.title}
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {pres.description}
                    </p>
                    {pres.tags && pres.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {pres.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Presentation →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-white/60 text-sm">
          <p>Personal utility pages collection.</p>
        </div>
      </div>
    </div>
  );
}
