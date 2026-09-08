import { PLACEMENTS, TIERS } from '../lib/sponsors';
import { bySlug, displayName, plateLabel } from '../lib/provinces';
import { schoolName } from '../lib/format';

/**
 * Navbar altında sürekli akan sponsorlu okul şeridi.
 *
 * Sponsorluk ticari bir yerleşimdir, kalite göstergesi değil — bu yüzden
 * şeridin başında kalıcı bir "Sponsorlu" etiketi durur ve her kart kendi
 * kademesini yazar. Hareket, üzerine gelince durur ve
 * prefers-reduced-motion açıkken hiç başlamaz.
 */
export default function SponsorTicker({
  onOpen,
}: {
  onOpen: (provinceSlug: string, ilce: string, ad: string) => void;
}) {
  const items = PLACEMENTS;
  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-[72px] z-40 border-b border-line bg-surface/94 backdrop-blur-md">
      <div className="marquee mx-auto flex h-11 max-w-[1400px] items-center gap-3 overflow-hidden px-4 sm:px-6">
        <span className="badge badge-sponsor shrink-0">Sponsorlu</span>
        <span className="h-4 w-px shrink-0 bg-line" aria-hidden="true" />

        <div className="relative flex-1 overflow-hidden">
          <div className="marquee-track items-center gap-8">
            {/* Kesintisiz akış için liste iki kez basılır */}
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center gap-8 pr-8 pl-4" aria-hidden={copy === 1}>
                {items.map((p) => {
                  const meta = bySlug(p.province);
                  if (!meta) return null;
                  return (
                    <button
                      key={`${copy}-${p.ad}`}
                      type="button"
                      tabIndex={copy === 1 ? -1 : 0}
                      onClick={() => onOpen(p.province, p.ilce, p.ad)}
                      className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap"
                    >
                      <span className="plate rounded border border-amber/35 bg-white px-1.5 py-0.5 text-[10.5px] text-amber-700">
                        {plateLabel(meta)}
                      </span>
                      <span className="text-[13.5px] font-semibold text-ink group-hover:text-amber-700">
                        {schoolName(p.ad)}
                      </span>
                      <span className="text-[12.5px] text-amber-700/75">
                        {displayName(meta)} · {TIERS[p.tier].label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Kenarlarda yumuşak kesim */}
          <span
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-surface to-transparent"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-surface to-transparent"
            aria-hidden="true"
          />
        </div>

        <span className="hidden h-4 w-px shrink-0 bg-line sm:block" aria-hidden="true" />
        <a
          href="#sponsorluk"
          className="hidden shrink-0 whitespace-nowrap text-[12.5px] font-semibold text-brand underline underline-offset-4 hover:text-ink sm:block"
        >
          Okulunuzu ekleyin
        </a>
      </div>
    </div>
  );
}
