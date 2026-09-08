const nf = new Intl.NumberFormat('tr-TR');

export const n = (v: number) => nf.format(v);

export const rating = (v: number) => v.toFixed(1).replace('.', ',');

/** MEB kayıtları büyük harf; okunabilir hale getirir. */
export function titleCase(s: string) {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/(^|[\s./(-])([\p{L}])/gu, (_m, p, c: string) => p + c.toLocaleUpperCase('tr-TR'));
}

/** "ÖZEL GEMLİK ATALAR ANAOKULU" -> "Özel Gemlik Atalar Anaokulu" */
export const schoolName = (s: string) => titleCase(s);

/** Uzun MEB adresini kısaltır. */
export function shortAddress(a: string) {
  const t = titleCase(a.replace(/\s*\(DİĞER İÇ KAPILAR:[^)]*\)/i, '').trim());
  return t.length > 96 ? t.slice(0, 95).trimEnd() + '…' : t;
}

export function telHref(t: string) {
  const d = t.replace(/\D/g, '');
  return d ? `tel:+90${d}` : undefined;
}

/** Kurum türünü kısa bir etikete indirger. */
export function levelOf(tur: string): 'anaokulu' | 'ilkokul' | 'ortaokul' | 'lise' | 'diger' {
  const t = tur.toLocaleLowerCase('tr-TR');
  if (t.includes('okul öncesi') || t.includes('anaokul')) return 'anaokulu';
  if (t.includes('ilkokul')) return 'ilkokul';
  if (t.includes('ortaokul')) return 'ortaokul';
  if (t.includes('lise')) return 'lise';
  return 'diger';
}

export const LEVEL_LABEL: Record<ReturnType<typeof levelOf>, string> = {
  anaokulu: 'Anaokulu',
  ilkokul: 'İlkokul',
  ortaokul: 'Ortaokul',
  lise: 'Lise',
  diger: 'Diğer',
};

export const relTime = (ts: number) => {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'az önce';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} sa önce`;
  return new Date(ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
};
