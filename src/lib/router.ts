import { useEffect, useState } from 'react';

/**
 * Küçük bir hash yönlendirici.
 *
 * Sayfa adresleri `#/` ile başlar (`#/okullar-icin`), bölüm bağlantıları ise
 * düz kalır (`#harita`). Böylece ana sayfadaki kaydırma bağlantıları
 * yönlendiriciyle çakışmıyor ve ek bir kütüphaneye gerek kalmıyor.
 */
export type Route =
  | { name: 'home' }
  | { name: 'about' }
  | { name: 'schools' }
  | { name: 'legal'; doc: LegalDoc };

export type LegalDoc = 'kvkk' | 'gizlilik' | 'kosullar' | 'puanlama';

const LEGAL: Record<string, LegalDoc> = {
  '#/kvkk': 'kvkk',
  '#/gizlilik': 'gizlilik',
  '#/kullanim-kosullari': 'kosullar',
  '#/kosullar': 'kosullar',
  '#/puanlama-kurallari': 'puanlama',
  '#/puanlama': 'puanlama',
};

export const PATHS = {
  home: '#/',
  about: '#/neden-eniyiokul',
  schools: '#/okullar-icin',
  kvkk: '#/kvkk',
  gizlilik: '#/gizlilik',
  kosullar: '#/kullanim-kosullari',
  puanlama: '#/puanlama-kurallari',
} as const;

function parse(hash: string): Route {
  if (!hash.startsWith('#/')) return { name: 'home' };
  if (hash === PATHS.schools) return { name: 'schools' };
  if (hash === PATHS.about || hash === '#/hakkinda') return { name: 'about' };
  const doc = LEGAL[hash];
  if (doc) return { name: 'legal', doc };
  return { name: 'home' };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));

  useEffect(() => {
    const onHash = () => {
      const next = parse(window.location.hash);
      setRoute(next);
      // Sayfa değişiminde başa dön; bölüm bağlantılarına dokunma.
      if (window.location.hash.startsWith('#/')) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return route;
}

export const go = (path: string) => {
  window.location.hash = path;
};
