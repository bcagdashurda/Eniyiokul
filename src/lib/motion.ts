import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Kaydırmayla beliren içerik.
 *
 * `gsap.from(..., autoAlpha: 0)` kullanmıyoruz: o desen elemanı hemen
 * gizliyor ve tetikleyici herhangi bir sebeple çalışmazsa (JS hatası,
 * yenilenmeyen ölçüm, ekran görüntüsü aracı) içerik kalıcı olarak
 * kayboluyor. Burada içerik varsayılan olarak görünür; gizleme ancak
 * GSAP gerçekten çalıştığında yapılıyor.
 */
export function reveal(
  targets: gsap.TweenTarget,
  opts: {
    trigger?: Element | string | null;
    y?: number;
    x?: number;
    stagger?: number;
    duration?: number;
    delay?: number;
    start?: string;
  } = {},
) {
  const {
    trigger,
    y = 24,
    x = 0,
    stagger = 0.07,
    duration = 0.7,
    delay = 0,
    start = 'top 82%',
  } = opts;

  const els = gsap.utils.toArray<Element>(targets);
  if (els.length === 0) return;

  // Zaten görünür olan öğeyi hiç gizlemiyoruz. Aksi halde tetikleyici
  // herhangi bir sebeple çalışmazsa (ölçüm tazelenmemiş, pencere aniden
  // büyümüş, sayfa altına atlanmış) içerik kalıcı olarak kayboluyordu.
  const fold = window.innerHeight * 0.92;
  const inView: Element[] = [];
  const below: Element[] = [];
  els.forEach((el) => {
    (el.getBoundingClientRect().top < fold ? inView : below).push(el);
  });

  if (inView.length) {
    gsap.set(inView, { autoAlpha: 0, y, x });
    gsap.to(inView, {
      autoAlpha: 1,
      y: 0,
      x: 0,
      duration,
      delay,
      stagger,
      ease: 'expo.out',
    });
  }

  if (below.length) {
    gsap.set(below, { autoAlpha: 0, y, x });
    gsap.to(below, {
      autoAlpha: 1,
      y: 0,
      x: 0,
      duration,
      stagger,
      ease: 'expo.out',
      scrollTrigger: { trigger: (trigger as Element) ?? below[0], start, once: true },
    });
  }
}

/**
 * Sayı sayacı. Yalnızca görünür alana girdiğinde bir kez çalışır ve
 * bittiğinde tam değeri yazar (yuvarlama hatası kalmasın).
 */
export function countUp(
  el: Element,
  value: number,
  format: (v: number) => string,
  /** Zaten ekranda olan sayılar için 'top bottom' verin, yoksa 0'da kalır. */
  start = 'top 88%',
) {
  const obj = { v: 0 };
  const write = (v: number) => {
    el.textContent = format(v);
  };
  gsap.to(obj, {
    v: value,
    duration: 1.4,
    ease: 'expo.out',
    onStart: () => write(0),
    onUpdate: () => write(Math.round(obj.v)),
    // Yuvarlama artığı kalmasın diye bitişte tam değer yazılır.
    onComplete: () => write(value),
    scrollTrigger: { trigger: el, start, once: true },
  });
}

/** Hareket azaltma tercihi açıkken animasyonları hiç kurmaz. */
export function withMotion(fn: () => void) {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', fn);
  return () => mm.revert();
}

/** Veri geldikten sonra ölçümleri tazele — yükseklikler değişiyor. */
export const refreshTriggers = () => ScrollTrigger.refresh();
