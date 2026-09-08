import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ProvinceSearch from './ProvinceSearch';
import Logo from './Logo';
import { PATHS } from '../lib/router';
import type { Summary } from '../lib/types';

/**
 * Mobil gezinme çekmecesi.
 *
 * Satır yüksekliği 56 px (48 dp eşiğinin üstünde), satır arası 8 px,
 * `touch-action: manipulation` ile dokunma gecikmesi kapalı ve
 * `overscroll-behavior: contain` ile arkadaki sayfa kaymıyor.
 */
type Item = { href: string; label: string; desc?: string; icon: string };

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: 'Keşfet',
    items: [
      {
        href: '#harita',
        label: 'Harita',
        desc: '81 ilin tamamı',
        icon: 'M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20zM9 4v13.5M15 6.5V20',
      },
      {
        href: '#okullar',
        label: 'Okullar',
        desc: 'Filtreleyerek listeleyin',
        icon: 'M3 10 12 5l9 5-9 5-9-5ZM7 12.5V17c0 1 2.2 2 5 2s5-1 5-2v-4.5',
      },
      {
        href: '#one-cikan',
        label: 'Öne çıkanlar',
        desc: 'Sponsorlu okullar',
        icon: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z',
      },
    ],
  },
  {
    title: 'Bilgi',
    items: [
      {
        href: PATHS.about,
        label: 'Neden eniyiokul',
        desc: 'Puanlar nasıl oluşuyor',
        icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 8h.01M11 12h1v5h1',
      },
      {
        href: PATHS.puanlama,
        label: 'Puanlama kuralları',
        desc: 'Hangi puan geçerli',
        icon: 'M6 3h9l5 5v13H6zM15 3v5h5M9 13h7M9 17h5',
      },
    ],
  },
  {
    title: 'Okullar için',
    items: [
      {
        href: PATHS.schools,
        label: 'Okulunuzu ekleyin',
        desc: 'Profil ve sponsorluk',
        icon: 'M12 5v14M5 12h14',
      },
    ],
  },
];

export default function MobileMenu({
  open,
  onClose,
  summary,
  onSelectProvince,
  onOpenSchool,
  onHome,
}: {
  open: boolean;
  onClose: () => void;
  summary: Summary | null;
  onSelectProvince: (slug: string) => void;
  onOpenSchool: (provinceSlug: string, ilce: string, ad: string) => void;
  onHome: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  /* Açılış ve kapanış hareketi */
  useEffect(() => {
    if (!open) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tl = gsap.timeline();
    if (reduce) {
      gsap.set([backdrop.current, panel.current], { autoAlpha: 1, x: 0 });
    } else {
      tl.fromTo(backdrop.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22 })
        .fromTo(
          panel.current,
          { xPercent: 100 },
          { xPercent: 0, duration: 0.42, ease: 'expo.out' },
          '-=0.14',
        )
        .from(
          '.mm-row',
          { autoAlpha: 0, x: 18, duration: 0.34, stagger: 0.035, ease: 'expo.out' },
          '-=0.22',
        );
    }
    closeBtn.current?.focus();
    return () => {
      tl.kill();
    };
  }, [open]);

  /* Arkadaki sayfa kaymasın, Escape kapatsın, odak içeride kalsın */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button, input, [tabindex]:not([tabindex="-1"])',
      );
      if (!nodes?.length) return;
      const list = Array.from(nodes).filter((el) => el.offsetParent !== null);
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const href = (h: string) => (h.startsWith('#/') || onHome ? h : PATHS.home);

  return (
    <div className="fixed inset-0 z-[80] xl:hidden" role="dialog" aria-modal="true" aria-label="Menü">
      <div
        ref={backdrop}
        onClick={onClose}
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
      />

      <div
        ref={panel}
        className="absolute inset-y-0 right-0 flex w-[88%] max-w-[400px] flex-col bg-surface shadow-[-8px_0_40px_-12px_rgba(15,27,36,.35)]"
        style={{ touchAction: 'manipulation', overscrollBehavior: 'contain' }}
      >
        {/* Başlık */}
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
          <a href={PATHS.home} onClick={onClose} aria-label="Ana sayfa">
            <Logo size="sm" />
          </a>
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line text-muted transition-colors hover:bg-bg-2 hover:text-ink"
            aria-label="Menüyü kapat"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Arama */}
        {summary && (
          <div className="border-b border-line px-4 py-3.5">
            <ProvinceSearch
              summary={summary}
              onPick={(s) => {
                onSelectProvince(s);
                onClose();
              }}
              onOpenSchool={(a, b, c) => {
                onOpenSchool(a, b, c);
                onClose();
              }}
            />
          </div>
        )}

        {/* Bağlantılar */}
        <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Mobil gezinme">
          {GROUPS.map((g, gi) => (
            <div key={g.title} className={gi > 0 ? 'mt-6' : ''}>
              <p className="label px-1 pb-2 text-muted-2">{g.title}</p>
              <ul className="space-y-2">
                {g.items.map((it) => (
                  <li key={it.label}>
                    <a
                      href={href(it.href)}
                      onClick={onClose}
                      className="mm-row flex min-h-[56px] items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 transition-colors active:bg-bg-2"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--color-brand)"
                          strokeWidth="1.9"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d={it.icon} />
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold text-ink">{it.label}</span>
                        {it.desc && (
                          <span className="block text-[12.5px] text-muted">{it.desc}</span>
                        )}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-muted-2)"
                        strokeWidth="2"
                        className="shrink-0"
                        aria-hidden="true"
                      >
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Alt eylem */}
        <div
          className="border-t border-line bg-bg px-4 py-4"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <a
            href={onHome ? '#okullar' : PATHS.home}
            onClick={onClose}
            className="btn btn-primary h-12 min-h-12 w-full text-[15px]"
          >
            Okulları listele
          </a>
          <div className="mt-3 flex items-center justify-between gap-3 text-[12.5px]">
            <a href="mailto:merhaba@eniyiokul.com" className="text-muted hover:text-ink">
              merhaba@eniyiokul.com
            </a>
            <a href={PATHS.kvkk} onClick={onClose} className="text-muted hover:text-ink">
              KVKK
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
