"use client";

import Link from 'next/link';

export default function InvestmentPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/pages"
            className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            ← Back to Pages
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📊</span> Investment Overview
          </h1>
        </div>
      </header>

      {/* Embedded App */}
      <main className="flex-1">
        <iframe
          src="/pages/investment/app.html"
          className="w-full h-full border-0"
          title="Investment Overview"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        />
      </main>
    </div>
  );
}
