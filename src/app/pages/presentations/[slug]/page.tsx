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
      {/* Embedded Presentation */}
      <main className="flex-1">
        <iframe
          src={`/pages/presentations/${slug}/index.html`}
          className="w-full h-full border-0"
          title={presentation.title}
          style={{ minHeight: '100vh' }}
          allowFullScreen
        />
      </main>
    </div>
  );
}
