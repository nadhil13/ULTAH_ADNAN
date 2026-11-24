import { useSmoothScroll } from '../hooks/useSmoothScroll';

interface FooterProps {
  celebrantName: string;
  senderName: string;
}

export function Footer({ celebrantName, senderName }: FooterProps) {
  const { scrollTo } = useSmoothScroll();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="paper-panel relative z-10 border-t py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-xs leading-relaxed text-muted">
          Monograf ulang tahun untuk {celebrantName}, dibuat dan disusun oleh {senderName}, {currentYear}.
        </p>

        <button
          type="button"
          onClick={() => scrollTo(0, 0)}
          className="inline-flex min-h-11 items-center justify-center self-start sm:self-auto rounded-[8px] border border-border-hairline bg-surface px-4 py-2 text-xs font-medium text-ink hover:border-accent hover:text-accent transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Kembali ke Sampul Atas
        </button>
      </div>
    </footer>
  );
}
