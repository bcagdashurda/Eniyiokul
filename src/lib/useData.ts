import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProvinceFile, Summary } from './types';

/** Kullandığımız kadarıyla GeoJSON — harici tip paketine gerek yok. */
export type Position = [number, number];
export type Geometry =
  | { type: 'Polygon'; coordinates: Position[][] }
  | { type: 'MultiPolygon'; coordinates: Position[][][] };

export type DistrictFeature = {
  type: 'Feature';
  properties: {
    ad: string;
    kaynakAd: string;
    eslesti: boolean;
    okulSayisi: number;
    merkez: Position;
  };
  geometry: Geometry;
};

export type DistrictFile = {
  type: 'FeatureCollection';
  il: string;
  ilceSayisi: number;
  features: DistrictFeature[];
};

export type ProvinceFeature = {
  type: 'Feature';
  properties: { name: string };
  geometry: Geometry;
};

export type ProvinceGeo = {
  type: 'FeatureCollection';
  features: ProvinceFeature[];
};

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} yüklenemedi (${r.status})`);
  return (await r.json()) as T;
}

/** Açılışta gereken iki dosya: il sınırları + ülke geneli özet. */
export function useAtlas() {
  const [geo, setGeo] = useState<ProvinceGeo | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getJSON<ProvinceGeo>('data/tr-provinces.json'),
      getJSON<Summary>('data/summary.json'),
    ])
      .then(([g, s]) => {
        if (!alive) return;
        setGeo(g);
        setSummary(s);
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  return { geo, summary, error, loading: !geo || !summary };
}

/** Bir il seçildiğinde okul listesi ve ilçe sınırlarını getirir (önbellekli). */
export function useProvinceDetail(slug: string | null) {
  const [detail, setDetail] = useState<ProvinceFile | null>(null);
  const [districts, setDistricts] = useState<DistrictFile | null>(null);
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map<string, [ProvinceFile, DistrictFile]>());

  useEffect(() => {
    if (!slug) {
      setDetail(null);
      setDistricts(null);
      return;
    }
    const hit = cache.current.get(slug);
    if (hit) {
      setDetail(hit[0]);
      setDistricts(hit[1]);
      return;
    }
    let alive = true;
    setLoading(true);
    Promise.all([
      getJSON<ProvinceFile>(`data/provinces/${slug}.json`),
      getJSON<DistrictFile>(`data/districts/${slug}.json`),
    ])
      .then(([p, d]) => {
        if (!alive) return;
        cache.current.set(slug, [p, d]);
        setDetail(p);
        setDistricts(d);
      })
      .catch(() => {
        if (!alive) return;
        setDetail(null);
        setDistricts(null);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  return { detail, districts, loading };
}

/** Ana sayfadaki öne çıkan okullar için birkaç ili önden yükler. */
export function usePrefetch(slugs: string[]) {
  const [files, setFiles] = useState<Record<string, ProvinceFile>>({});
  const key = slugs.join(',');

  const load = useCallback(async () => {
    const out: Record<string, ProvinceFile> = {};
    await Promise.all(
      slugs.map(async (s) => {
        try {
          out[s] = await getJSON<ProvinceFile>(`data/provinces/${s}.json`);
        } catch {
          /* bu il atlanır */
        }
      }),
    );
    setFiles(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    void load();
  }, [load]);

  return files;
}
