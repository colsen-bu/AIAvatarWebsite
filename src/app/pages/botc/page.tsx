"use client";

export default function BotcPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Embedded App */}
      <main className="flex-1">
        <iframe
          src="/pages/botc/app.html"
          className="w-full h-full border-0"
          title="Blood on the Clocktower Grimoire"
          style={{ minHeight: '100vh' }}
        />
      </main>
    </div>
  );
}
