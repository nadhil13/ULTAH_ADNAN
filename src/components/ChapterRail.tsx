import { useEffect, useState } from 'react';
import { useSmoothScroll } from '../hooks/useSmoothScroll';

interface ChapterMarker {
  index: string;
  id: string;
  label: string;
}

const CHAPTER_MARKERS: ChapterMarker[] = [
  { index: '01', id: 'beranda', label: 'Sampul' },
  { index: '02', id: 'dedikasi', label: 'Dedikasi' },
  { index: '03', id: 'babak', label: 'Babak' },
  { index: '04', id: 'arsip', label: 'Arsip' },
  { index: '05', id: 'surat', label: 'Surat' },
  { index: '06', id: 'lilin', label: 'Lilin' },
  { index: '07', id: 'ucapan', label: 'Ucapan' },
];

export function ChapterRail() {
  const { scrollTo } = useSmoothScroll();
  const [activeId, setActiveId] = useState<string>('beranda');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.max(0, Math.min(1, scrollTop / docHeight)) : 0;
      setProgress(ratio);

      const viewportFocus = window.innerHeight * 0.36;
      let current = CHAPTER_MARKERS[0].id;
      for (const marker of CHAPTER_MARKERS) {
        const el = document.getElementById(marker.id);
        if (!el) {
          continue;
        }
        const rect = el.getBoundingClientRect();
        if (rect.top <= viewportFocus) {
          current = marker.id;
        }
      }
      setActiveId(current);
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  return (
    <aside
      aria-label="Penunjuk bab monograf"
      className="pointer-events-none fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 xl:flex flex-col items-end gap-3"
    >
      <div className="pointer-events-auto relative flex flex-col items-end gap-2.5 pr-4">
        <div
          aria-hidden="true"
          className="absolute right-0 top-1 bottom-1 w-px bg-border-hairline"
        >
          <div
            className="w-full origin-top bg-accent transition-transform duration-150 ease-out"
            style={{
              height: '100%',
              transform: `scaleY(${Math.max(0.04, progress)})`,
            }}
          />
        </div>

        {CHAPTER_MARKERS.map((marker) => {
          const isActive = activeId === marker.id;
          return (
            <button
              key={marker.id}
              type="button"
              onClick={() =>
                scrollTo(marker.id === 'beranda' ? 0 : `#${marker.id}`, marker.id === 'beranda' ? 0 : -64)
              }
              aria-label={`Menuju bagian ${marker.index}: ${marker.label}`}
              aria-current={isActive ? 'location' : undefined}
              className="group relative flex items-center gap-2 py-0.5 text-right cursor-pointer"
            >
              <span
                className={`rounded-[4px] bg-canvas/90 px-1.5 py-0.5 text-[11px] transition-opacity duration-200 ${
                  isActive
                    ? 'opacity-100 text-ink font-medium'
                    : 'opacity-0 group-hover:opacity-100 text-muted'
                }`}
              >
                {marker.label}
              </span>
              <span
                className={`rounded-[4px] bg-canvas/90 px-1 py-0.5 text-[11px] tabular-nums transition-colors ${
                  isActive
                    ? 'font-semibold text-accent'
                    : 'text-muted/75 group-hover:text-ink'
                }`}
              >
                {marker.index}
              </span>
              <span
                aria-hidden="true"
                className={`absolute -right-[19px] h-[5px] w-[5px] rounded-full transition-transform duration-200 ${
                  isActive
                    ? 'scale-125 bg-accent'
                    : 'scale-75 bg-border-hairline group-hover:bg-muted'
                }`}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
