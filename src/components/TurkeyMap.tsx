import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import gsap from 'gsap';
import type { DistrictFile, ProvinceGeo } from '../lib/useData';
import type { Summary } from '../lib/types';
import { byGeoName, displayName, plateLabel } from '../lib/provinces';
import { n, titleCase } from '../lib/format';

type Props = {
  geo: ProvinceGeo;
  summary: Summary;
  activeSlug: string | null;
  districts: DistrictFile | null;
  activeDistrict: string | null;
  onSelectProvince: (slug: string | null) => void;
  onSelectDistrict: (name: string | null) => void;
  /** Üstte duran panellerin kapladığı alan — kamera bunları hesaba katar. */
  inset?: { right: number; top: number; bottom: number };
};

const NO_INSET = { right: 0, top: 0, bottom: 0 };

type Label = {
  key: string;
  text: string;
  sub: string | null;
  /** Etiketin çizileceği yer (çakışma varsa merkezden kaydırılmış olabilir). */
  x: number;
  y: number;
  /** İlçenin gerçek merkezi — kaydırma olduğunda kılavuz çizgisi buraya iner. */
  ax: number;
  ay: number;
  w: number;
  /** Hiçbir yere sığmadıysa yalnızca konum noktası çizilir. */
  dotOnly: boolean;
};

/* Merkez dolu ise etiket sırayla bu kaymalarda denenir. */
const OFFSETS: [number, number][] = [
  [0, 0],
  [0, -22],
  [0, 22],
  [-40, 0],
  [40, 0],
  [-36, -20],
  [36, -20],
  [-36, 20],
  [36, 20],
  [0, -40],
  [0, 40],
];

/**
 * Renk rampaları.
 *
 * Tek tonlu açık bir rampada komşu kademeler birbirinden yeterince ayrışmıyor
 * ve harita cansız görünüyor. Adaylar çok tonlu: koyulaştıkça renk de kayıyor,
 * böylece ayrışma artıyor ama ton ağırlaşmıyor.
 *
 * Denemek için adres satırına ?ramp=b ya da ?ramp=c ekleyin.
 */
export const RAMPS: Record<string, string[]> = {
  // a — mevcut: tek tonlu petrol (sakin ama düşük ayrışma)
  a: ['#f1f7f7', '#dceef0', '#bfdfe4', '#98c9d1', '#6cadb9', '#42909f', '#1f6e7e'],
  // b — nane → petrol → derin mavi: kurumsal, ayrışması yüksek
  b: ['#f2faf7', '#cdeee6', '#99dcd4', '#5cc4c2', '#2ba0ad', '#1d7594', '#1b4d78'],
  // c — sıcak kum → petrol → gece mavisi: editoryal, kağıt zeminle uyumlu
  c: ['#f8f5ec', '#dcecdf', '#aedcd6', '#71c2c5', '#3f9fac', '#256f8c', '#1a4668'],
};

function pickRamp() {
  if (typeof window === 'undefined') return RAMPS.b;
  const k = new URLSearchParams(window.location.search).get('ramp');
  return (k && RAMPS[k]) || RAMPS.b;
}

export const RAMP = pickRamp();

/* Okulu olmayan yer, ölçeğin en açık tonuyla karışmasın diye nötr gri.
   Ayrıca üzerine ince tarama deseni geçirilir — "veri yok" için standart
   kartografik işaret. */
const EMPTY_FILL = '#e4e8e7';

/**
 * Yoğunluk → renk.
 *
 * Dağılım aşırı çarpık (İstanbul 3.518, Gümüşhane 2). Doğrusal ya da
 * karekök ölçekte illerin neredeyse tamamı en açık iki tonda toplanıyor ve
 * harita bilgi taşımıyordu. Bunun yerine sıfır olmayan değerlerin
 * kuantillerine göre bölünüyor: her ton yaklaşık eşit sayıda yeri temsil eder.
 */
export function makeScale(values: number[]) {
  const nz = values.filter((v) => v > 0).sort((a, b) => a - b);
  if (nz.length === 0) return () => EMPTY_FILL;

  const cuts: number[] = [];
  for (let i = 1; i < RAMP.length; i++) {
    cuts.push(nz[Math.floor((i / RAMP.length) * nz.length)] ?? nz[nz.length - 1]);
  }

  return (count: number) => {
    if (count <= 0) return EMPTY_FILL;
    let i = 0;
    while (i < cuts.length && count >= cuts[i]) i++;
    return RAMP[Math.min(i, RAMP.length - 1)];
  };
}

/* Etiket genişliğini ölçmek için tek bir offscreen canvas. */
let ctx2d: CanvasRenderingContext2D | null = null;
/** Vurgu konturu — komşuların üstünde ayrı katmanda çizilir. */
function HiPath({
  shapes,
  ad,
  cls,
}: {
  shapes: { ad: string; d: string }[];
  ad: string;
  cls: string;
}) {
  const d = shapes.find((x) => x.ad === ad);
  if (!d) return null;
  return <path d={d.d} className={cls} vectorEffect="non-scaling-stroke" />;
}

function textWidth(t: string, font: string) {
  if (!ctx2d) ctx2d = document.createElement('canvas').getContext('2d');
  if (!ctx2d) return t.length * 7;
  ctx2d.font = font;
  return ctx2d.measureText(t).width;
}

export default function TurkeyMap({
  geo,
  summary,
  activeSlug,
  districts,
  activeDistrict,
  onSelectProvince,
  onSelectDistrict,
  inset = NO_INSET,
}: Props) {
  /* Nesne kimliği her render'da değişiyordu; bağımlılıklarda ilkel
     değerler kullanılıyor, aksi halde etiket hesabı kendini tetikliyor. */
  const insetRight = inset.right;
  const insetTop = inset.top;
  const insetBottom = inset.bottom;
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<SVGGElement>(null);
  const labelLayer = useRef<SVGGElement>(null);
  const view = useRef({ k: 1, x: 0, y: 0 });

  const [size, setSize] = useState({ w: 1200, h: 700 });
  const [labels, setLabels] = useState<Label[]>([]);
  const [hover, setHover] = useState<{ slug: string; cx: number; cy: number } | null>(null);
  const [hoverD, setHoverD] = useState<string | null>(null);
  const [dTip, setDTip] = useState<{ x: number; y: number } | null>(null);
  /* Yakınlaştırılmışken tek parmak haritayı kaydırır; bu sırada tarayıcının
     kendi kaydırması ve "aşağı çekip yenile" davranışı kapatılmalı. */
  const [panning, setPanning] = useState(false);

  /* Kap boyutunu izle — harita gerçekten tam ekran dolsun. */
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width > 0 && height > 0) setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Projeksiyon kabın oranına göre kurulur. */
  const { path, projection } = useMemo(() => {
    // Üstteki şerit/kart ve alttaki bilgi çubuğu haritayı örtmesin diye
    // ülke görünümü de bu boşlukların içine yerleşir.
    const padX = Math.max(28, size.w * 0.035);
    const top = insetTop + 16;
    const bottom = insetBottom + 16;
    const p = geoMercator().fitExtent(
      [
        [padX, top],
        [size.w - padX, Math.max(top + 120, size.h - bottom)],
      ],
      geo as never,
    );
    return { path: geoPath(p), projection: p };
    // Yalnızca üst/alt boşluk projeksiyonu etkiler. Sağdaki panel
    // açılıp kapandığında harita yeniden çizilmesin diye inset.right
    // burada bilerek kullanılmıyor; o yalnızca kamerayı kaydırır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo, size, insetTop, insetBottom]);

  const counts = useMemo(
    () => new Map(summary.iller.map((i) => [i.slug, i.sayi])),
    [summary],
  );
  const provinceScale = useMemo(
    () => makeScale(summary.iller.map((i) => i.sayi)),
    [summary],
  );

  const features = useMemo(
    () =>
      geo.features
        .map((f) => {
          const meta = byGeoName(f.properties.name);
          if (!meta) return null;
          const d = path(f as never);
          if (!d) return null;
          return { meta, d, centroid: path.centroid(f as never), f };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [geo, path],
  );

  const districtShapes = useMemo(() => {
    if (!districts) return [];
    const scale = makeScale(districts.features.map((d) => d.properties.okulSayisi));
    return districts.features
      .map((d) => {
        const dd = path(d as never);
        if (!dd) return null;
        return {
          ad: d.properties.ad,
          count: d.properties.okulSayisi,
          d: dd,
          centroid: projection(d.properties.merkez) ?? path.centroid(d as never),
          fill: scale(d.properties.okulSayisi),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [districts, path, projection]);

  /* --- Etiketleme: kamera durduktan sonra, çarpışma testiyle ---
     Etiketler dönüşümsüz katmanda (ekran koordinatı) çizilir; böylece
     yakınlaştırma ne olursa olsun punto sabit kalır ve üst üste binmez. */
  const placeLabels = useCallback(() => {
    const { k, x: tx, y: ty } = view.current;
    const zoomed = Boolean(activeSlug);

    // Yakınlaşınca ilçe adı + sayı iki satır; ülke görünümünde tek satır.
    const font = '600 12px Inter, system-ui, sans-serif';
    const plainFont = '600 10.5px Inter, system-ui, sans-serif';
    const subFont = '600 10px "JetBrains Mono", monospace';
    const boxH = 31;
    const padX = 9;
    // Etiketler arası nefes payı — sıkışık batıda okunurluğu korur
    const gap = zoomed ? 4 : 3;

    const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
    const out: Label[] = [];

    const source: {
      key: string;
      text: string;
      sub: string | null;
      p: [number, number];
      rank: number;
    }[] = zoomed
      ? districtShapes.map((d) => ({
          key: d.ad,
          text: titleCase(d.ad),
          // Okulu olmayan ilçe sadece adıyla, sönük biçimde geçer.
          sub: d.count > 0 ? `${n(d.count)} okul` : null,
          p: d.centroid as [number, number],
          rank: d.count,
        }))
      : features.map((f) => ({
          key: f.meta.slug,
          text: displayName(f.meta),
          sub: null,
          p: f.centroid as [number, number],
          rank: counts.get(f.meta.slug) ?? 0,
        }));

    // Yoğun yer önce yerleşir; kalanlara sığdığı kadar yer verilir.
    source.sort((a, b) => b.rank - a.rank);

    const hits = (b: { x0: number; y0: number; x1: number; y1: number }) =>
      placed.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);

    // Kullanılabilir alan: etiket kutusunun tamamı buraya sığmalı.
    const minX = 6;
    const maxX = size.w - insetRight - 6;
    const minY = insetTop + 6;
    const maxY = size.h - insetBottom - 6;
    const inBounds = (b: { x0: number; y0: number; x1: number; y1: number }) =>
      b.x0 >= minX && b.x1 <= maxX && b.y0 >= minY && b.y1 <= maxY;

    // Dar ekranda 81 il adı aynı anda sığmıyor. Başlangıçta en yoğun
    // birkaçı gösteriliyor, yakınlaştırdıkça sayı artıyor.
    const narrow = size.w < 700;
    const cap = zoomed
      ? 40
      : narrow
        ? Math.round(Math.min(40, Math.max(8, 8 + (k - 1) * 14)))
        : 81;

    for (const s of source) {
      if (out.length >= cap) break;
      const ax = s.p[0] * k + tx;
      const ay = s.p[1] * k + ty;
      if (ax < minX || ay < minY || ax > maxX || ay > maxY) continue;

      // İki satırlı (adı + sayı) etiket daha yüksek yer kaplar.
      const twoLine = Boolean(s.sub);
      const h = twoLine ? boxH : 15;
      const tw = Math.max(
        textWidth(s.text, twoLine ? font : plainFont),
        s.sub ? textWidth(s.sub, subFont) : 0,
      );
      const w = tw + (twoLine ? padX * 2 : 6);

      // Merkez doluysa etiketi kaydırarak yer aranır; okulu olan bir ilçenin
      // etiketi çakışma yüzünden kaybolmasın.
      let done = false;
      for (const [ox, oy] of OFFSETS) {
        const sx = ax + ox;
        const sy = ay + oy;
        const box = {
          x0: sx - w / 2 - gap,
          y0: sy - h / 2 - gap,
          x1: sx + w / 2 + gap,
          y1: sy + h / 2 + gap,
        };
        // Kutunun tamamı görünür alanda olmalı; aksi halde etiket kenardan taşıyordu.
        if (!inBounds(box) || hits(box)) continue;
        placed.push(box);
        out.push({ key: s.key, text: s.text, sub: s.sub, x: sx, y: sy, ax, ay, w, dotOnly: false });
        done = true;
        break;
      }
      if (done) continue;

      // Sığmadıysa konum bir noktayla korunur. Dar ekranda ülke görünümünde
      // 81 nokta gürültü olacağı için bundan vazgeçiliyor.
      if (narrow && !zoomed) continue;
      const dot = { x0: ax - 3, y0: ay - 3, x1: ax + 3, y1: ay + 3 };
      if (!hits(dot)) {
        placed.push(dot);
        out.push({ key: s.key, text: s.text, sub: s.sub, x: ax, y: ay, ax, ay, w, dotOnly: true });
      }
    }
    setLabels(out);
  }, [activeSlug, districtShapes, features, counts, size, insetRight]);

  /* --- Kamera --- */
  const flyTo = useCallback(
    (bounds: [[number, number], [number, number]] | null, instant = false) => {
      const g = zoomRef.current;
      if (!g) return;

      let target = { k: 1, x: 0, y: 0 };
      if (bounds) {
        // Panellerin kapladığı alanı düşerek gerçek boş alanın ortasına yerleş.
        const availW = Math.max(240, size.w - insetRight);
        const availH = Math.max(240, size.h - insetTop - insetBottom);
        const cx = availW / 2;
        const cy = insetTop + availH / 2;

        const [[x0, y0], [x1, y1]] = bounds;
        const bw = Math.max(x1 - x0, 1);
        const bh = Math.max(y1 - y0, 1);
        const k = Math.min((availW * 0.8) / bw, (availH * 0.8) / bh, 14);
        target = { k, x: cx - k * ((x0 + x1) / 2), y: cy - k * ((y0 + y1) / 2) };
      }

      const apply = () => {
        const v = view.current;
        g.setAttribute('transform', `translate(${v.x} ${v.y}) scale(${v.k})`);
        setPanning(v.k > 1.05);
      };

      // Süren tweenler durdurulur. Etiket katmanınınki de: aksi halde
      // sönme animasyonu, hemen ardından yapılan "göster" atamasını ezip
      // etiketleri görünmez bırakıyordu.
      gsap.killTweensOf(view.current);
      gsap.killTweensOf(labelLayer.current);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (instant || reduce) {
        Object.assign(view.current, target);
        apply();
        placeLabels();
        gsap.set(labelLayer.current, { autoAlpha: 1 });
        return;
      }

      // Kamera hareket ederken etiketler saklanır, yerine oturunca belirir.
      gsap.to(labelLayer.current, { autoAlpha: 0, duration: 0.22, ease: 'power2.out' });
      gsap.to(view.current, {
        ...target,
        duration: 1.0,
        ease: 'expo.inOut',
        onUpdate: apply,
        onComplete: () => {
          placeLabels();
          gsap.to(labelLayer.current, { autoAlpha: 1, duration: 0.42, ease: 'power2.out' });
        },
      });
    },
    [size, placeLabels, insetRight, insetTop, insetBottom],
  );

  /* --- Parmak hareketleri ---
     Tek parmak yalnızca yakınlaştırılmışken kaydırır; aksi halde sayfa
     normal biçimde kayabilsin diye dokunuş serbest bırakılır. İki parmak
     her zaman yakınlaştırır. */
  const applyView = useCallback(() => {
    const v = view.current;
    zoomRef.current?.setAttribute('transform', `translate(${v.x} ${v.y}) scale(${v.k})`);
    // Aynı değerle çağrıldığında React yeniden çizmez, her karede güvenli.
    setPanning(v.k > 1.05);
  }, []);

  const settle = useCallback(() => {
    placeLabels();
    gsap.killTweensOf(labelLayer.current);
    gsap.set(labelLayer.current, { autoAlpha: 1 });
  }, [placeLabels]);

  const touch = useRef<{
    mode: 'none' | 'pan' | 'pinch';
    x: number;
    y: number;
    dist: number;
    k0: number;
    raf: number;
  }>({ mode: 'none', x: 0, y: 0, dist: 0, k0: 1, raf: 0 });

  const dist2 = (t: React.TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  /** Hareket başlarken: tweenleri durdur, etiketleri gizle, katmanı yükselt. */
  const beginGesture = () => {
    gsap.killTweensOf(view.current);
    gsap.killTweensOf(labelLayer.current);
    // Etiketler ekran koordinatında durduğu için harita altlarından kayıyordu.
    gsap.set(labelLayer.current, { autoAlpha: 0 });
    zoomRef.current?.style.setProperty('will-change', 'transform');
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      beginGesture();
      touch.current = {
        ...touch.current,
        mode: 'pinch',
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        dist: dist2(e.touches),
        k0: view.current.k,
      };
    } else if (e.touches.length === 1 && view.current.k > 1.05) {
      beginGesture();
      touch.current = {
        ...touch.current,
        mode: 'pan',
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        dist: 0,
        k0: view.current.k,
      };
    } else {
      touch.current.mode = 'none';
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const t = touch.current;
    if (t.mode === 'none') return;
    e.preventDefault();
    const v = view.current;

    if (t.mode === 'pinch' && e.touches.length === 2) {
      const d = dist2(e.touches);
      const k = Math.min(14, Math.max(1, t.k0 * (d / (t.dist || d))));
      const r = wrapRef.current?.getBoundingClientRect();
      const cx = t.x - (r?.left ?? 0);
      const cy = t.y - (r?.top ?? 0);
      // Parmakların ortasını sabit tutarak ölçekle
      v.x = cx - ((cx - v.x) / v.k) * k;
      v.y = cy - ((cy - v.y) / v.k) * k;
      v.k = k;
    } else if (t.mode === 'pan' && e.touches.length === 1) {
      v.x += e.touches[0].clientX - t.x;
      v.y += e.touches[0].clientY - t.y;
      t.x = e.touches[0].clientX;
      t.y = e.touches[0].clientY;
    }

    // Kare başına bir kez çiz. Dokunuş olayları ekran tazelemesinden sık
    // gelebiliyor; her birinde yazmak gereksiz yeniden çizim demek.
    if (!t.raf) {
      t.raf = requestAnimationFrame(() => {
        t.raf = 0;
        applyView();
      });
    }
  };

  const onTouchEnd = () => {
    const t = touch.current;
    if (t.mode === 'none') return;
    t.mode = 'none';
    if (t.raf) {
      cancelAnimationFrame(t.raf);
      t.raf = 0;
    }
    applyView();
    zoomRef.current?.style.removeProperty('will-change');
    settle();
  };

  /** Düğmelerle yakınlaştırma (masaüstü ve erişilebilirlik için). */
  const zoomBy = useCallback(
    (factor: number) => {
      gsap.killTweensOf(view.current);
      const v = view.current;
      const k = Math.min(14, Math.max(1, v.k * factor));
      const cx = (size.w - insetRight) / 2;
      const cy = (insetTop + size.h - insetBottom) / 2;
      v.x = cx - ((cx - v.x) / v.k) * k;
      v.y = cy - ((cy - v.y) / v.k) * k;
      v.k = k;
      applyView();
      settle();
    },
    [size, insetRight, insetTop, insetBottom, applyView, settle],
  );

  /* Aktif il / kap boyutu değiştiğinde kamerayı yerleştir. */
  const firstRun = useRef(true);
  const lastSlug = useRef<string | null>(null);
  useEffect(() => {
    // Yalnızca pencere boyutu değiştiyse animasyona gerek yok — anında yerleş,
    // aksi halde etiketler her yeniden boyutlandırmada kaybolup geliyordu.
    const sameTarget = lastSlug.current === activeSlug;
    const instant = firstRun.current || sameTarget;
    lastSlug.current = activeSlug;
    firstRun.current = false;

    if (!activeSlug) {
      flyTo(null, instant);
      return;
    }
    const hit = features.find((x) => x.meta.slug === activeSlug);
    if (hit) {
      flyTo(path.bounds(hit.f as never) as [[number, number], [number, number]], instant);
    }
  }, [activeSlug, features, path, flyTo]);

  /* İlçe verisi kamera durduktan sonra gelirse etiketleri tazele. */
  useEffect(() => {
    if (!activeSlug || districtShapes.length === 0) return;
    const t = window.setTimeout(() => {
      placeLabels();
      gsap.killTweensOf(labelLayer.current);
      gsap.set(labelLayer.current, { autoAlpha: 1 });
    }, 60);
    return () => window.clearTimeout(t);
  }, [districtShapes, activeSlug, placeLabels]);

  /* Escape ile geri. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (activeDistrict) onSelectDistrict(null);
      else if (activeSlug) onSelectProvince(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeSlug, activeDistrict, onSelectProvince, onSelectDistrict]);

  const hoveredSummary = hover ? summary.iller.find((i) => i.slug === hover.slug) : null;
  const hoveredMeta = hover ? features.find((f) => f.meta.slug === hover.slug)?.meta : null;

  return (
    <div
      ref={wrapRef}
      className="map-ground absolute inset-0 overflow-hidden"
      style={{
        // Uzaklaşmışken sayfa normal kaysın; yakınlaşınca parmak haritayı
        // sürüklesin. overscroll-behavior sayfayı yenilemeyi de kapatır.
        touchAction: panning ? 'none' : 'pan-y',
        overscrollBehavior: 'contain',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size.w} ${size.h}`}
        width={size.w}
        height={size.h}
        className={`block h-full w-full ${activeSlug ? 'map-focused' : ''}`}
        role="img"
        aria-label={`Türkiye özel okul haritası: ${n(summary.toplamKurum)} okul, 81 il. Bir ile tıklayarak ilçelere inebilirsiniz.`}
        onMouseLeave={() => {
          setHover(null);
          setHoverD(null);
        }}
      >
        <defs>
          {/* Okul kaydı olmayan ilçeler için tarama deseni */}
          <pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="9" stroke="rgba(15,27,36,.07)" strokeWidth="1.2" />
          </pattern>
        </defs>

        <g ref={zoomRef}>
          {/* İller.
              Seçili il gizlenir: onun yerini kendi ilçeleri alır. İl ve ilçe
              sınırları ayrı veri setlerinden geldiği için ikisini üst üste
              çizmek kenarlarda uyuşmazlık yaratıyordu. */}
          {features.map(({ meta, d, centroid }) => {
            const c = counts.get(meta.slug) ?? 0;
            const active = meta.slug === activeSlug;
            // Seçili il: kendi poligonu ilçelerin altında sessiz bir zemin
            // olarak kalır; iki veri setinin kenar farkından doğacak
            // beyaz boşlukları kapatır.
            if (active && districtShapes.length > 0) {
              return (
                <path
                  key={meta.slug}
                  d={d}
                  fill="#e6edec"
                  stroke="none"
                  className="pointer-events-none"
                />
              );
            }
            return (
              <path
                key={meta.slug}
                d={d}
                className="province"
                vectorEffect="non-scaling-stroke"
                data-active={active}
                style={{ ['--fill' as string]: provinceScale(c) }}
                onMouseEnter={() =>
                  !activeSlug && setHover({ slug: meta.slug, cx: centroid[0], cy: centroid[1] })
                }
                onClick={() => onSelectProvince(active ? null : meta.slug)}
                tabIndex={0}
                role="button"
                aria-label={`${displayName(meta)}: ${n(c)} özel okul`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectProvince(active ? null : meta.slug);
                  }
                }}
              />
            );
          })}

          {/* İlin dış hattı.
              İlçelerin tamamı önce kalın konturla çizilir; ardından gelen
              dolgular iç kenarların konturunu kapatır ve yalnızca ilin dış
              hattı görünür kalır. Böylece dış hat ilçelerle birebir çakışır —
              ayrı bir il poligonu kullanılsaydı kenarlarda tutmazdı. */}
          {activeSlug && districtShapes.length > 0 && (
            <g
              className="pointer-events-none"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth={4}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            >
              {districtShapes.map((d) => (
                <path key={`o-${d.ad}`} d={d.d} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          )}

          {/* İlçeler — yalnızca bir il seçiliyken */}
          {activeSlug &&
            districtShapes.map((d) => {
              const on = d.ad === activeDistrict;
              return (
                <path
                  key={d.ad}
                  d={d.d}
                  className="district"
                  vectorEffect="non-scaling-stroke"
                  style={{
                    fill: on ? 'var(--color-amber)' : d.fill,
                    // Üzerine gelinen ilçe öne çıksın diye diğerleri hafif geri çekilir
                    opacity: hoverD && d.ad !== hoverD && !on ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    setHoverD(d.ad);
                    const r = wrapRef.current?.getBoundingClientRect();
                    if (r) setDTip({ x: e.clientX - r.left, y: e.clientY - r.top });
                  }}
                  onMouseMove={(e) => {
                    const r = wrapRef.current?.getBoundingClientRect();
                    if (r) setDTip({ x: e.clientX - r.left, y: e.clientY - r.top });
                  }}
                  onMouseLeave={() => setHoverD((v) => (v === d.ad ? null : v))}
                  onFocus={() => setHoverD(d.ad)}
                  onBlur={() => setHoverD((v) => (v === d.ad ? null : v))}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDistrict(on ? null : d.ad);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${titleCase(d.ad)} ilçesi: ${n(d.count)} okul`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectDistrict(on ? null : d.ad);
                    }
                  }}
                />
              );
            })}

          {/* Okulu olmayan ilçelere ince tarama — "kayıt yok" işareti */}
          {activeSlug &&
            districtShapes
              .filter((d) => d.count === 0)
              .map((d) => (
                <path
                  key={`h-${d.ad}`}
                  d={d.d}
                  fill="url(#hatch)"
                  stroke="none"
                  className="pointer-events-none"
                />
              ))}

          {/* Vurgular en üstte: komşu dolgular kalın konturu kesmesin */}
          {activeSlug && hoverD && hoverD !== activeDistrict && (
            <HiPath shapes={districtShapes} ad={hoverD} cls="district-hi" />
          )}
          {activeSlug && activeDistrict && (
            <HiPath shapes={districtShapes} ad={activeDistrict} cls="district-sel" />
          )}
        </g>

        {/* Etiketler: ekran koordinatında — yakınlaşma puntoyu bozmaz.
            Renkli poligon üzerinde halo yeterince okunmadığı için
            etiketler kendi zemininde durur. */}
        <g ref={labelLayer} className="pointer-events-none" aria-hidden="true">
          {labels.map((l) =>
            l.dotOnly ? (
              <circle
                key={l.key}
                cx={l.x}
                cy={l.y}
                r={2.2}
                fill="var(--color-ink)"
                fillOpacity={0.42}
                stroke="#fff"
                strokeWidth={1.1}
              />
            ) : l.sub ? (
              /* Okulu olan ilçe: kendi zemininde adı ve sayısı */
              <g key={l.key}>
                {/* Etiket merkeze sığmayıp kaydıysa kılavuz çizgisiyle bağlanır */}
                {(Math.abs(l.x - l.ax) > 1 || Math.abs(l.y - l.ay) > 1) && (
                  <>
                    <line
                      x1={l.ax}
                      y1={l.ay}
                      x2={l.x}
                      y2={l.y}
                      stroke="rgba(15,27,36,.35)"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                    />
                    <circle cx={l.ax} cy={l.ay} r={2.4} fill="var(--color-ink)" />
                  </>
                )}
                <g transform={`translate(${l.x} ${l.y})`}>
                <rect
                  x={-l.w / 2}
                  y={-15.5}
                  width={l.w}
                  height={31}
                  rx={8}
                  fill="#fff"
                  fillOpacity={0.95}
                  stroke="rgba(15,27,36,.12)"
                  strokeWidth={1}
                />
                <text
                  textAnchor="middle"
                  y={-2}
                  style={{ font: '600 12px Inter, system-ui, sans-serif', fill: 'var(--color-ink)' }}
                >
                  {l.text}
                </text>
                <text
                  textAnchor="middle"
                  y={10}
                  style={{ font: '600 10px "JetBrains Mono", monospace', fill: 'var(--color-brand)' }}
                >
                  {l.sub}
                </text>
                </g>
              </g>
            ) : (
              /* İl adı (ülke görünümü) ya da okulu olmayan ilçe — halo ile */
              <text
                key={l.key}
                x={l.x}
                y={l.y + 3.5}
                textAnchor="middle"
                style={{
                  font: '600 10.5px Inter, system-ui, sans-serif',
                  fill: activeSlug ? 'var(--color-muted-2)' : 'var(--color-ink)',
                  paintOrder: 'stroke',
                  stroke: 'rgba(255,255,255,.92)',
                  strokeWidth: 3.2,
                  strokeLinejoin: 'round',
                }}
              >
                {l.text}
              </text>
            ),
          )}
        </g>
      </svg>

      {/* Yakınlaştırma düğmeleri */}
      <div
        className="absolute right-3 z-20 flex flex-col overflow-hidden rounded-xl border border-line bg-surface/95 shadow-[var(--shadow-card)] backdrop-blur"
        style={{ top: insetTop + 12 }}
      >
        <button
          type="button"
          onClick={() => zoomBy(1.6)}
          className="grid h-10 w-10 place-items-center text-muted transition-colors hover:bg-bg-2 hover:text-ink"
          aria-label="Yakınlaştır"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <span className="h-px bg-line" aria-hidden="true" />
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.6)}
          className="grid h-10 w-10 place-items-center text-muted transition-colors hover:bg-bg-2 hover:text-ink"
          aria-label="Uzaklaştır"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>

      {/* İlçe ipucu — tıklamadan önce ilçenin ne olduğu görünsün */}
      {activeSlug && hoverD && dTip && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+14px)]"
          style={{ left: dTip.x, top: dTip.y }}
        >
          <div className="float rounded-xl px-3 py-2">
            <p className="text-[13.5px] font-semibold text-ink">{titleCase(hoverD)}</p>
            {(() => {
              const c = districtShapes.find((x) => x.ad === hoverD)?.count ?? 0;
              return (
                <p className="mt-0.5 text-[12px] text-muted tnum">
                  {c > 0 ? `${n(c)} özel okul` : 'Kayıtlı özel okul yok'}
                </p>
              );
            })()}
          </div>
        </div>
      )}

      {/* İl ipucu — ülke görünümünde */}
      {hover && hoveredSummary && hoveredMeta && !activeSlug && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+16px)]"
          style={{ left: hover.cx, top: hover.cy }}
        >
          <div className="float rounded-xl px-3.5 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="plate rounded border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[11px] text-brand-600">
                {plateLabel(hoveredMeta)}
              </span>
              <span className="text-[14px] font-semibold text-ink">
                {displayName(hoveredMeta)}
              </span>
            </div>
            <div className="mt-1 text-[12.5px] text-muted tnum">
              {n(hoveredSummary.sayi)} özel okul · {hoveredSummary.ilceSayisi} ilçe
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
