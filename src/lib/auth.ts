import { useEffect, useState } from 'react';

/**
 * SMS doğrulaması.
 *
 * Puan yalnızca telefonu doğrulanmış hesaplardan alınır: sahte ve toplu
 * puanlamanın önündeki en pratik engel bu. Bir numara bir hesaptır, bir
 * hesap bir okula bir kez puan verir.
 *
 * Bu prototipte kod gönderimi ve doğrulama tarayıcıda taklit ediliyor;
 * üretimde bu katmanın yerini bir SMS sağlayıcısı ve sunucu tarafı
 * doğrulama alır, arayüz aynı kalır.
 */
const KEY = 'eniyiokul.session.v1';

export type Session = {
  /** Yalnızca maskelenmiş hâli saklanır: 0532 *** ** 41 */
  masked: string;
  verifiedAt: number;
};

type Listener = (s: Session | null) => void;
const listeners = new Set<Listener>();
let cache: Session | null | undefined;

function read(): Session | null {
  if (cache !== undefined) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    cache = null;
  }
  return cache;
}

function write(s: Session | null) {
  cache = s;
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* özel mod: oturum yalnızca bu sekmede yaşar */
  }
  listeners.forEach((l) => l(s));
}

/** "0532 123 45 67" -> "0532 *** ** 67" */
export function maskPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(-10);
  if (d.length < 10) return '';
  return `0${d.slice(0, 3)} *** ** ${d.slice(8)}`;
}

export function isValidPhone(raw: string) {
  const d = raw.replace(/\D/g, '');
  // 10 hane (5xxxxxxxxx) ya da başında 0 / 90 ile
  const core = d.length === 10 ? d : d.length === 11 && d[0] === '0' ? d.slice(1) : d.length === 12 && d.startsWith('90') ? d.slice(2) : '';
  return core.length === 10 && core[0] === '5';
}

export function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  const x = d.startsWith('0') ? d.slice(1) : d;
  const p = [x.slice(0, 3), x.slice(3, 6), x.slice(6, 8), x.slice(8, 10)].filter(Boolean);
  return p.length ? `0${p.join(' ')}` : '';
}

export function verify(phone: string) {
  write({ masked: maskPhone(phone), verifiedAt: Date.now() });
}

export function signOut() {
  write(null);
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(read);
  useEffect(() => {
    const l: Listener = (s) => setSession(s);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return session;
}
