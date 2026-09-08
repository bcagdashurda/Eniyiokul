# -*- coding: utf-8 -*-
"""
MEB Ozel Ogretim Kurumlari Genel Mudurlugu - okul verisi cekici.

Iki cikti uretir:
  data/schools_bursa.json  -> Bursa'daki tum ozel okullarin tam kaydi
  data/province_counts.json -> 81 il icin okul sayisi (harita choropleth'i icin)
"""
import json
import os
import re
import ssl
import sys
import time
import urllib.request
from html import unescape
from concurrent.futures import ThreadPoolExecutor

BASE = "https://ookgm.meb.gov.tr/kurumlar.php"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data")
os.makedirs(OUT, exist_ok=True)

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept-Language": "tr-TR,tr;q=0.9",
}


def fetch(url, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=60, context=CTX) as r:
                return r.read().decode("utf-8", errors="replace")
        except Exception as e:
            if i == tries - 1:
                print("  ! FAIL %s -> %s" % (url, e), file=sys.stderr)
                return ""
            time.sleep(1.5 * (i + 1))
    return ""


TAG = re.compile(r"<[^>]+>")
ROW = re.compile(r"<tr>\s*(.*?)\s*</tr>", re.S)
CELL = re.compile(r"<td[^>]*>(.*?)</td>", re.S)


def clean(s):
    s = TAG.sub(" ", s)
    s = unescape(s)
    return re.sub(r"\s+", " ", s).strip()


def parse_rows(html):
    """Tablodaki okul satirlarini cikarir."""
    out = []
    body = html
    tb = body.find("<tbody>")
    if tb != -1:
        body = body[tb:body.find("</tbody>", tb)]
    for m in ROW.finditer(body):
        cells = CELL.findall(m.group(1))
        if len(cells) < 5:
            continue
        vals = [clean(c) for c in cells]
        # <td>no</td><td>ilce</td><td>ad</td><td>tur</td><td>adres</td><td>tel</td>
        if not vals[1] or not vals[2]:
            continue
        out.append({
            "ilce": vals[1],
            "ad": vals[2],
            "tur": vals[3] if len(vals) > 3 else "",
            "adres": vals[4] if len(vals) > 4 else "",
            "tel": vals[5] if len(vals) > 5 else "",
        })
    return out


COUNT_RE = re.compile(r"([\d\.]+)\s*adet kurum bulundu")
PAGE_RE = re.compile(r"sayfa=(\d+)")


def get_count(html):
    m = COUNT_RE.search(html)
    if not m:
        return 0
    return int(m.group(1).replace(".", ""))


def get_provinces(html):
    sel = re.search(r'name="il"(.*?)</select>', html, re.S)
    if not sel:
        return []
    return re.findall(r'<option\s+value="([^"]+)"', sel.group(1))


def province_url(il, sayfa=1):
    return "%s?sayfa=%d&tur=okul&il=%s&tur2=0" % (
        BASE, sayfa, urllib.parse.quote(il))


def scrape_province_full(il):
    """Bir ilin tum sayfalarini gezip kayitlari toplar."""
    first = fetch(province_url(il, 1))
    if not first:
        return il, 0, []
    total = get_count(first)
    rows = parse_rows(first)
    pages = [int(p) for p in PAGE_RE.findall(first)]
    maxpage = max(pages) if pages else 1
    for p in range(2, maxpage + 1):
        h = fetch(province_url(il, p))
        rows.extend(parse_rows(h))
    # tekrar edenleri temizle
    seen, uniq = set(), []
    for r in rows:
        k = (r["ad"], r["ilce"], r["adres"])
        if k in seen:
            continue
        seen.add(k)
        uniq.append(r)
    return il, total, uniq


def main():
    import urllib.parse as up
    globals()["urllib"].parse = up

    print(">> il listesi aliniyor...")
    seed = fetch(province_url("BURSA", 1))
    provinces = get_provinces(seed)
    provinces = [p for p in provinces if p and p != "0"]
    print("   %d il bulundu" % len(provinces))

    # 1) Bursa tam veri
    print(">> BURSA tam veri cekiliyor...")
    _, total_bursa, bursa = scrape_province_full("BURSA")
    print("   toplam=%d, cekilen=%d" % (total_bursa, len(bursa)))
    with open(os.path.join(OUT, "schools_bursa.json"), "w", encoding="utf-8") as f:
        json.dump({"il": "BURSA", "toplam": total_bursa, "okullar": bursa},
                  f, ensure_ascii=False, indent=1)

    # 2) Tum iller icin sayi
    print(">> 81 il icin okul sayilari cekiliyor...")
    counts = {}

    def one(il):
        h = fetch(province_url(il, 1))
        return il, get_count(h)

    with ThreadPoolExecutor(max_workers=6) as ex:
        for il, c in ex.map(one, provinces):
            counts[il] = c
            print("   %-22s %5d" % (il, c))

    with open(os.path.join(OUT, "province_counts.json"), "w", encoding="utf-8") as f:
        json.dump(counts, f, ensure_ascii=False, indent=1)

    print(">> bitti. toplam kurum: %d" % sum(counts.values()))


if __name__ == "__main__":
    import urllib.parse
    main()
