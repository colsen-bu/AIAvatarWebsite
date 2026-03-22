"use client";

export default function InvoicerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Embedded App */}
      <main className="flex-1">
        <iframe
          src="/pages/invoicer/app.html"
          className="w-full h-full border-0"
          title="Invoice Generator"
          style={{ minHeight: '100vh' }}
        />
      </main>
    </div>
  );
}
