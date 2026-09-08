import { useEffect, useRef, useState } from 'react';
import ProvinceSearch from './ProvinceSearch';
import MobileMenu from './MobileMenu';
import Logo from './Logo';
import { PATHS } from '../lib/router';
import type { Summary } from '../lib/types';

/* Ana sayfa veliye dönük. Bölüm bağlantıları ana sayfada kaydırır,
   sayfa bağlantıları her yerden çalışır. */
const SECTIONS = [
  { id: 'harita', label: 'Harita' },
  { id: 'okullar', label: 'Okullar' },
  { id: 'one-cikan', label: 'Öne çıkanlar' },
];

const PAGES = [{ href: PATHS.about, label: 'Neden eniyiokul' }];

export default function Navbar({
  summary,
  onSelectProvince,
  onOpenSchool,
  onHome = true,
}: {
  summary: Summary | null;
  onSelectProvince: (slug: string) => void;
  onOpenSchool: (provinceSlug: string, ilce: string, ad: string) => void;
  /** Ana sayfada değilken bölüm bağlantıları ana sayfaya döner. */
  onHome?: boolean;
}) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('harita');
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setSolid(window.scrollY > 12);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Hangi bölümdeyiz — gezinmede yerini kaybetmemek için */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.2, 0.6] },
    );
    SECTIONS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [onHome]);

  return (
    <>
      <a
        href="#harita"
        className="sr-only-focusable fixed left-4 top-4 z-[200] rounded-lg bg-brand px-4 py-2.5 text-[14px] font-semibold text-white"
      >
        İçeriğe geç
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          solid
            ? 'border-line bg-surface/94 shadow-[0_1px_20px_-8px_rgba(15,27,36,.28)] backdrop-blur-xl'
            : 'border-line/50 bg-surface/80 backdrop-blur-md'
        }`}
      >
        <nav
          className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-6 px-4 sm:px-6"
          aria-label="Ana gezinme"
        >
          {/* Marka */}
          <a
            href={PATHS.home}
            className="shrink-0 transition-transform duration-300 hover:scale-[1.02]"
            aria-label="eniyiokul ana sayfa"
          >
            <Logo />
          </a>

          {/* Arama — haritanın üstünü kapatmasın diye başlıkta duruyor */}
          {summary && (
            <div className="hidden w-full max-w-[300px] md:block">
              <ProvinceSearch
                summary={summary}
                onPick={onSelectProvince}
                onOpenSchool={onOpenSchool}
                compact
              />
            </div>
          )}

          {/* Bölümler ve sayfalar */}
          <ul className="ml-auto hidden items-center gap-0.5 xl:flex">
            {SECTIONS.map((l) => {
              const on = onHome && active === l.id;
              return (
                <li key={l.id}>
                  <a
                    href={onHome ? `#${l.id}` : `${PATHS.home}`}
                    aria-current={on ? 'true' : undefined}
                    className={`relative block rounded-lg px-3.5 py-2 text-[14px] font-medium transition-colors ${
                      on ? 'text-ink' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {l.label}
                    <span
                      className="absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full bg-brand transition-transform duration-300"
                      style={{ transform: `scaleX(${on ? 1 : 0})`, transformOrigin: 'center' }}
                    />
                  </a>
                </li>
              );
            })}
            {PAGES.map((p) => (
              <li key={p.href}>
                <a
                  href={p.href}
                  className="relative block rounded-lg px-3.5 py-2 text-[14px] font-medium text-muted transition-colors hover:text-ink"
                >
                  {p.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Eylemler */}
          <div className="ml-auto flex items-center gap-2 xl:ml-0">
            <span className="mx-1 hidden h-6 w-px bg-line xl:block" aria-hidden="true" />
            {/* Okul sahipleri kendi ekranlarına buradan geçiyor;
                veliye dönük ana sayfada fiyat/teklif görünmüyor. */}
            <a
              href={PATHS.schools}
              className="btn btn-outline hidden h-10 min-h-10 lg:inline-flex"
            >
              Okulunuzu ekleyin
            </a>
            <a href={onHome ? '#okullar' : PATHS.home} className="btn btn-primary h-10 min-h-10">
              Okulları gör
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="btn btn-outline h-10 w-10 min-h-10 !px-0 xl:hidden"
              aria-expanded={open}
              aria-controls="mobil-menu"
              aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </nav>

      </header>

      <MobileMenu
        open={open}
        onClose={() => setOpen(false)}
        summary={summary}
        onSelectProvince={onSelectProvince}
        onOpenSchool={onOpenSchool}
        onHome={onHome}
      />
    </>
  );
}

