import { useCallback, useEffect, useState } from 'react';
import type { Criteria, Review } from './types';

/**
 * Değerlendirme deposu.
 *
 * Okullar puansız başlar; puan yalnızca veliler değerlendirdikçe oluşur.
 * Bu demoda kayıtlar tarayıcıda (localStorage) tutuluyor — üretimde
 * bu katmanın yerini API alır, arayüz aynı kalır.
 */
const KEY = 'okulpusula.reviews.v1';

type Listener = (all: Review[]) => void;
const listeners = new Set<Listener>();
let cache: Review[] | null = null;

function read(): Review[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Review[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: Review[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* kota dolu ya da özel mod — bellek içi kopya yine de çalışır */
  }
  listeners.forEach((l) => l(next));
}

export function addReview(r: Omit<Review, 'id' | 'createdAt'>): Review {
  const review: Review = {
    ...r,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  write([review, ...read()]);
  return review;
}

export function removeReview(id: string) {
  write(read().filter((r) => r.id !== id));
}

export const averageOf = (c: Criteria) => {
  const v = Object.values(c);
  return v.reduce((a, b) => a + b, 0) / v.length;
};

export type Aggregate = {
  count: number;
  average: number;
  perCriterion: Criteria;
};

export function aggregate(reviews: Review[]): Aggregate | null {
  if (reviews.length === 0) return null;
  const sum: Criteria = {
    akademik: 0, ogretmen: 0, imkanlar: 0, ucret: 0, iletisim: 0, sosyal: 0,
  };
  for (const r of reviews) {
    (Object.keys(sum) as (keyof Criteria)[]).forEach((k) => {
      sum[k] += r.criteria[k];
    });
  }
  const per = { ...sum };
  (Object.keys(per) as (keyof Criteria)[]).forEach((k) => {
    per[k] = per[k] / reviews.length;
  });
  return {
    count: reviews.length,
    average: averageOf(per),
    perCriterion: per,
  };
}

/** Tüm değerlendirmeleri canlı izler. */
export function useReviews() {
  const [all, setAll] = useState<Review[]>(read);

  useEffect(() => {
    const l: Listener = (next) => setAll(next);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const forSchool = useCallback(
    (id: string) => all.filter((r) => r.schoolId === id),
    [all],
  );

  return { all, forSchool };
}
