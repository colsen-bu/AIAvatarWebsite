"use client";

export default function CapeRentalPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Embedded App */}
      <main className="flex-1">
        <iframe
          src="/pages/cape-rental/app.html"
          className="w-full h-full border-0"
          title="Cape Rental Rate Analysis"
          style={{ minHeight: '100vh' }}
        />
      </main>
    </div>
  );
}
