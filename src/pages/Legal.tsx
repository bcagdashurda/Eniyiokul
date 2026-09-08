import { useEffect, useState } from 'react';
import { DOCS, type Block } from '../lib/legal';
import { PATHS, type LegalDoc } from '../lib/router';

const NAV: { doc: LegalDoc; path: string }[] = [
  { doc: 'kvkk', path: PATHS.kvkk },
  { doc: 'gizlilik', path: PATHS.gizlilik },
  { doc: 'kosullar', path: PATHS.kosullar },
  { doc: 'puanlama', path: PATHS.puanlama },
];

export default function Legal({ doc }: { doc: LegalDoc }) {
  const d = DOCS[doc];
  const [active, setActive] = useState('');

  /* Uzun metinlerde nerede olduğunuzu kaybetmemek için */
  useEffect(() => {
    const heads = Array.from(document.querySelectorAll<HTMLElement>('[data-head]'));
    if (heads.length === 0) return;
    const io = new IntersectionObserver(
      (es) => {
        const vis = es.filter((e) => e.isIntersecting)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: '-140px 0px -70% 0px' },
    );
    heads.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [doc]);

  const heads = d.blocks
    .map((b, i) => (b.t === 'h' ? { id: `b-${i}`, x: b.x } : null))
    .filter((x): x is { id: string; x: string } => x !== null);

  return (
    <main id="top" className="bg-surface pt-[72px]">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:py-16">
        <a
          href={PATHS.home}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted hover:text-ink"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
          </svg>
          Ana sayfaya dön
        </a>

        <div className="mt-8 grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
          {/* Belge listesi */}
          <aside className="lg:sticky lg:top-[100px] lg:self-start">
            <p className="label text-muted-2">Hukuki metinler</p>
            <nav className="mt-3 flex flex-col gap-0.5" aria-label="Hukuki metinler">
              {NAV.map((x) => (
                <a
                  key={x.doc}
                  href={x.path}
                  aria-current={x.doc === doc ? 'page' : undefined}
                  className={`rounded-lg px-3 py-2.5 text-[14px] transition-colors ${
                    x.doc === doc
                      ? 'bg-brand-50 font-semibold text-brand-600'
                      : 'text-muted hover:bg-bg-2 hover:text-ink'
                  }`}
                >
                  {DOCS[x.doc].title}
                </a>
              ))}
            </nav>

            {heads.length > 2 && (
              <>
                <p className="label mt-8 text-muted-2">Bu sayfada</p>
                <nav className="mt-3 flex flex-col gap-0.5 border-l border-line" aria-label="Sayfa içi">
                  {heads.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`-ml-px border-l-2 px-3 py-1.5 text-[13px] transition-colors ${
                        active === h.id
                          ? 'border-brand font-medium text-ink'
                          : 'border-transparent text-muted hover:text-ink'
                      }`}
                    >
                      {h.x}
                    </a>
                  ))}
                </nav>
              </>
            )}
          </aside>

          {/* Belge */}
          <article className="min-w-0 max-w-[760px]">
            <p className="label text-brand">Yasal</p>
            <h1 className="display mt-3 text-[clamp(30px,4vw,44px)] text-ink">{d.title}</h1>
            <p className="pretty mt-4 text-[16.5px] leading-relaxed text-muted">{d.intro}</p>
            <p className="mt-4 text-[13px] text-muted-2">Son güncelleme: {d.updated}</p>

            <div className="mt-8 rounded-xl border border-amber/30 bg-amber-50 p-4">
              <p className="text-[13.5px] leading-relaxed text-amber-700">
                <b>Prototip notu:</b> Bu metinler mevzuata uygun bir taslak olarak
                hazırlandı; köşeli parantezli alanlar şirket bilgileriyle
                doldurulmalı ve yayına çıkmadan önce bir avukat tarafından gözden
                geçirilmelidir. Burada yazılanlar hukuki görüş değildir.
              </p>
            </div>

            <div className="mt-10 space-y-5">
              {d.blocks.map((b, i) => (
                <Render key={i} b={b} id={`b-${i}`} />
              ))}
            </div>

            <div className="mt-14 rounded-2xl border border-line bg-bg p-6">
              <p className="display-sm text-[16px] text-ink">Sorunuz mu var?</p>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                Kişisel verilerinizle ilgili talepler için{' '}
                <a href="mailto:kvkk@eniyiokul.com" className="font-medium text-brand underline underline-offset-4">
                  kvkk@eniyiokul.com
                </a>
                , içerik bildirimleri için{' '}
                <a href="mailto:bildirim@eniyiokul.com" className="font-medium text-brand underline underline-offset-4">
                  bildirim@eniyiokul.com
                </a>
                .
              </p>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}

function Render({ b, id }: { b: Block; id: string }) {
  switch (b.t) {
    case 'h':
      return (
        <h2 id={id} data-head className="display-sm scroll-mt-[140px] pt-6 text-[20px] text-ink">
          {b.x}
        </h2>
      );

    case 'p':
      return <p className="pretty text-[15.5px] leading-[1.75] text-muted">{b.x}</p>;

    case 'ul':
      return (
        <ul className="space-y-2.5">
          {b.x.map((li) => (
            <li key={li} className="flex gap-3 text-[15px] leading-[1.7] text-muted">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300" />
              {li}
            </li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol className="space-y-2.5">
          {b.x.map((li, i) => (
            <li key={li} className="flex gap-3 text-[15px] leading-[1.7] text-muted">
              <span className="plate mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-brand-50 text-[11px] text-brand-600">
                {i + 1}
              </span>
              {li}
            </li>
          ))}
        </ol>
      );

    case 'table':
      return (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="bg-bg">
                {b.head.map((h) => (
                  <th key={h} className="border-b border-line px-4 py-3 text-[12.5px] font-semibold text-ink">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-b border-line-2 last:border-0">
                  {r.map((c, j) => (
                    <td
                      key={j}
                      className={`px-4 py-3 align-top text-[14px] leading-relaxed ${
                        j === 0 ? 'font-medium text-ink' : 'text-muted'
                      }`}
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'note':
      return (
        <p className="rounded-xl border-l-[3px] border-brand bg-brand-50 px-4 py-3 text-[14.5px] leading-relaxed text-brand-800">
          {b.x}
        </p>
      );
  }
}
