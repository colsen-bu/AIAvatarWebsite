"use client";

export default function InvestmentPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Embedded App */}
      <main className="flex-1">
        <iframe
          src="/pages/investment/app.html"
          className="w-full h-full border-0"
          title="Investment Overview"
          style={{ minHeight: '100vh' }}
        />
      </main>
    </div>
  );
}
