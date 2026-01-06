import Link from 'next/link';
import { notFound } from 'next/navigation';
import presentations from '../../../../../data/presentations.json';
import type { Presentation } from '../../../../types/presentations';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PresentationPage({ params }: PageProps) {
  const { slug } = await params;
  const presentation = (presentations as Presentation[]).find(p => p.slug === slug);

  if (!presentation) {
    notFound();
  }

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
            <span>{presentation.icon}</span> {presentation.title}
          </h1>
        </div>
        {presentation.tags && presentation.tags.length > 0 && (
          <div className="hidden md:flex items-center gap-2">
            {presentation.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Embedded Presentation */}
      <main className="flex-1">
        <iframe
          src={`/pages/presentations/${slug}/index.html`}
          className="w-full h-full border-0"
          title={presentation.title}
          style={{ minHeight: 'calc(100vh - 60px)' }}
          allowFullScreen
        />
      </main>
    </div>
  );
}
