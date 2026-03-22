"use client";

export default function PortlandTripPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Embedded App */}
      <main className="flex-1">
        <iframe
          src="/pages/portland-trip/app.html"
          className="w-full h-full border-0"
          title="Portland ME Trip Planner"
          style={{ minHeight: '100vh' }}
        />
      </main>
    </div>
  );
}
