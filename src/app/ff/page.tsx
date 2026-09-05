import Link from 'next/link';
import type { Metadata } from 'next';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'A Letter to Those Who Have Not Yet Been Solved',
  description:
    'A brief note on Game Theory Optimal fantasy football, humility, and the equilibrium.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://chrisolsen.work/ff' },
};

type Block =
  | { kind: 'p'; text: string; lead?: boolean }
  | { kind: 'figure'; n: number; src: string; alt: string; caption: string }
  | { kind: 'equilibrium'; text: string };

const letter: Block[] = [
  {
    kind: 'p',
    lead: true,
    text: `You may be wondering: What is GTO, and why have I just been slapped silly by this team? Where do I go from here? How can I possibly learn from the sheer, staggering magnitude of the greatness before me?`,
  },
  {
    kind: 'p',
    text: `Today, all of these questions will be answered—and more.`,
  },
  {
    kind: 'p',
    text: `I am a humble man. I stand atop mountains, gazing out alongside giants, yet no force on Earth can resist the crushing weight of Game Theory Optimal. That is why you have fallen. Many have fallen before you, and countless more will follow long after your season is reduced to a footnote, quietly absorbed into the cold, forgotten bowels of history.`,
  },
  {
    kind: 'figure',
    n: 1,
    src: 'summit',
    alt: 'Standing on a rocky summit above the treeline, clouds rolling across the valley below.',
    caption: `Atop a mountain, gazing out alongside giants. Elevation: unexploitable.`,
  },
  {
    kind: 'p',
    text: `But let us address what GTO actually is, because it is abundantly clear that the average roster in this division remains hopelessly unsolved.`,
  },
  {
    kind: 'p',
    text: `Game Theory Optimal. It means I do not play the game you wish I played. I do not play the game you think I am playing. I play the mathematically unexploitable strategy, week in and week out. While you are anxiously checking local weather radar on a Thursday evening, praying your emergency flex option isn't a backup running back who hasn't taken a meaningful snap since the Clinton administration, my machine is already whirring.`,
  },
  {
    kind: 'figure',
    n: 2,
    src: 'whirring',
    alt: 'Seated indoors at night, backwards cap, city lights and wet streets visible through the window.',
    caption: `Thursday evening. You are refreshing a weather radar. The machine is already whirring.`,
  },
  {
    kind: 'p',
    text: `You will look at the final score and protest: "But I had the better roster!"`,
  },
  {
    kind: 'p',
    text: `And I will nod. I will remain humble. I will look you in the eyes and say, "Yes, and I respect that."`,
  },
  {
    kind: 'p',
    text: `What I will actually be thinking, of course, is that you constructed a roster on pure vibes—on a gut feeling you got at a barbecue in late August. You are furious that I optimized every single slot with the cold, indifferent precision of a solver running ten thousand iterations while you were still trying to decide whether to start the guy with the favorable matchup or the guy with the cooler name.`,
  },
  {
    kind: 'p',
    text: `Next year, you will attempt to draft over me again. You will tell yourself, "This time will be different."`,
  },
  {
    kind: 'p',
    text: `It will not be different. Variance eventually smooths out, and when the dust clears, the GTO line will be the only structure still standing. You will claw at the waiver wire like a drowning man reaching for straws in a flash flood. Meanwhile, I will sit comfortably at my desk running algorithmic projections, looking almost bored.`,
  },
  {
    kind: 'p',
    text: `Almost. Because let us be completely honest with one another: I enjoy this. I enjoy it in a way that is, I willingly admit, slightly embarrassing to articulate in all caps.`,
  },
  {
    kind: 'p',
    text: `I shall not gloat further; to do so would be fundamentally un-GTO. A pure strategy leaves nothing for the opponent to exploit, and there is nothing left to exploit in a matchup against a manager who has already proven that standard play is a mathematical impossibility. You are, in the most precise, academic sense, a dominated strategy.`,
  },
  {
    kind: 'p',
    text: `I say this with immense warmth. I say this while taking a slow sip of tea. I say this as your starting wide receiver lands on the injury report and you desperately scroll through active trade offers, searching for a miracle that isn't coming.`,
  },
  {
    kind: 'figure',
    n: 3,
    src: 'harvest',
    alt: 'Standing in a sunlit field holding a full box of freshly picked cherries.',
    caption: `The harvest. Optimally allocated, naturally.`,
  },
  {
    kind: 'equilibrium',
    text: `There is no counter. There is no exploit. There is only the equilibrium—and the equilibrium is me.`,
  },
];

function Figure({ n, src, alt, caption }: { n: number; src: string; alt: string; caption: string }) {
  return (
    <figure className="my-12 sm:my-16">
      <div className="border border-neutral-200 dark:border-neutral-800 p-1.5">
        <picture>
          <source srcSet={`/ff/${src}.webp`} type="image/webp" />
          <img
            src={`/ff/${src}.jpg`}
            alt={alt}
            width={1400}
            height={1867}
            loading="lazy"
            decoding="async"
            className="w-full h-auto"
          />
        </picture>
      </div>
      <figcaption className="mt-3 flex gap-3 text-[11px] sm:text-xs leading-relaxed text-gray-500 dark:text-gray-500">
        <span className="shrink-0 tabular-nums uppercase tracking-[0.18em]">
          Fig. {String(n).padStart(2, '0')}
        </span>
        <span className="border-l border-neutral-200 dark:border-neutral-800 pl-3">{caption}</span>
      </figcaption>
    </figure>
  );
}

export default function FantasyFootballManifestoPage() {
  return (
    <div className="min-h-screen px-6 sm:px-8 py-12 sm:py-20">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-16 sm:mb-24">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors inline-flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            back
          </Link>
          <ThemeToggle />
        </div>

        <header>
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-gray-500 dark:text-gray-500">
            League Correspondence
          </p>
          <h1 className="mt-5 text-[1.85rem] leading-[1.12] sm:text-[2.75rem] sm:leading-[1.08] font-bold tracking-tight text-gray-900 dark:text-white">
            A Letter to Those Who Have Not Yet Been Solved
          </h1>
          <dl className="mt-10 pt-5 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-[10px] sm:text-[11px] uppercase tracking-[0.18em]">
            {[
              ['Strategy', 'Pure'],
              ['Exploits', 'None available'],
              ['Tone', 'Humble'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-gray-400 dark:text-gray-600">{k}</dt>
                <dd className="mt-1.5 text-gray-700 dark:text-gray-300">{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <article className="mt-14 sm:mt-20">
          {letter.map((block, i) => {
            if (block.kind === 'figure') {
              return <Figure key={i} {...block} />;
            }

            if (block.kind === 'equilibrium') {
              return (
                <p
                  key={i}
                  className="my-12 sm:my-16 border-l-2 border-neutral-900 dark:border-neutral-100 pl-5 sm:pl-7 text-lg sm:text-2xl leading-[1.5] font-bold tracking-tight text-gray-900 dark:text-white"
                >
                  {block.text}
                </p>
              );
            }

            return (
              <p
                key={i}
                className={
                  block.lead
                    ? 'mb-7 text-base sm:text-[1.0625rem] leading-[1.85] text-gray-900 dark:text-gray-100'
                    : 'mb-7 text-[15px] sm:text-base leading-[1.9] text-gray-600 dark:text-gray-300'
                }
              >
                {block.text}
              </p>
            );
          })}
        </article>

        <footer className="mt-16 sm:mt-20 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-base sm:text-lg text-gray-900 dark:text-white">You are most welcome.</p>
          <p className="mt-8 text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-gray-400 dark:text-gray-600">
            — The Equilibrium
          </p>
        </footer>
      </div>
    </div>
  );
}
