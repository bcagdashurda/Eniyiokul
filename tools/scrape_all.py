# -*- coding: utf-8 -*-
"""
MEB OOKGM - 81 il icin TUM ozel okul kayitlarini ceker.

Cikti:
  data/provinces/<slug>.json   -> il basina tam okul listesi
  data/summary.json            -> harita icin il ozetleri (gercek kayit sayisi)
"""
import json
import os
import re
import ssl
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from html import unescape
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding="utf-8")

BASE = "https://ookgm.meb.gov.tr/kurumlar.php"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "data")
PD = os.path.join(D, "provinces")
os.makedirs(PD, exist_ok=True)

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept-Language": "tr-TR,tr;q=0.9",
}

TAG = re.compile(r"<[^>]+>")
ROW = re.compile(r"<tr>\s*(.*?)\s*</tr>", re.S)
CELL = re.compile(r"<td[^>]*>(.*?)</td>", re.S)
COUNT_RE = re.compile(r"([\d\.]+)\s*adet kurum bulundu")
PAGE_RE = re.compile(r"sayfa=(\d+)")
# 'selected' bayragi olan option'i da yakalar  (onceki bug)
OPT_RE = re.compile(r"<option[^>]*\svalue=\"([^\"]+)\"")

TR_UP = str.maketrans("iıgüsöc", "İIGÜSÖC")


def fetch(url, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=90, context=CTX) as r:
                return r.read().decode("utf-8", errors="replace")
        except Exception as e:
            if i == tries - 1:
                print("  ! FAIL %s -> %s" % (url, e))
                return ""
            time.sleep(2 * (i + 1))
    return ""


def clean(s):
    s = unescape(TAG.sub(" ", s))
    return re.sub(r"\s+", " ", s).strip()


def slugify(s):
    s = (s.replace("ı", "i").replace("İ", "i").replace("ğ", "g").replace("Ğ", "g")
          .replace("ü", "u").replace("Ü", "u").replace("ş", "s").replace("Ş", "s")
          .replace("ö", "o").replace("Ö", "o").replace("ç", "c").replace("Ç", "c"))
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def parse_rows(html):
    out = []
    tb = html.find("<tbody>")
    body = html[tb:html.find("</tbody>", tb)] if tb != -1 else html
    for m in ROW.finditer(body):
        v = [clean(c) for c in CELL.findall(m.group(1))]
        if len(v) < 5 or not v[1] or not v[2]:
            continue
        out.append({
            "ilce": v[1], "ad": v[2], "tur": v[3],
            "adres": v[4], "tel": v[5] if len(v) > 5 else "",
        })
    return out


def url_for(il, sayfa=1):
    return "%s?sayfa=%d&tur=okul&il=%s&tur2=0" % (BASE, sayfa, urllib.parse.quote(il))


def scrape_one(il):
    first = fetch(url_for(il, 1))
    if not first:
        return il, 0, []
    reported = int((COUNT_RE.search(first).group(1).replace(".", ""))
                   if COUNT_RE.search(first) else 0)
    rows = parse_rows(first)
    pages = [int(p) for p in PAGE_RE.findall(first)]
    maxp = max(pages) if pages else 1
    if maxp > 1:
        with ThreadPoolExecutor(max_workers=4) as ex:
            futs = {ex.submit(fetch, url_for(il, p)): p for p in range(2, maxp + 1)}
            for f in as_completed(futs):
                rows.extend(parse_rows(f.result()))
    seen, uniq = set(), []
    for r in rows:
        k = (r["ad"], r["ilce"], r["adres"])
        if k not in seen:
            seen.add(k)
            uniq.append(r)
    return il, reported, uniq


def main():
    print(">> il listesi...")
    seed = fetch(url_for("BURSA", 1))
    sel = re.search(r'name="il"(.*?)</select>', seed, re.S).group(1)
    provinces = [p for p in OPT_RE.findall(sel) if p and p != "0"]
    print("   %d il" % len(provinces))
    if len(provinces) != 81:
        print("   ! uyari: 81 bekleniyordu")

    summary, grand = [], 0
    with ThreadPoolExecutor(max_workers=5) as ex:
        futs = {ex.submit(scrape_one, il): il for il in provinces}
        for f in as_completed(futs):
            il, reported, rows = f.result()
            slug = slugify(il)
            ilceler = sorted({r["ilce"] for r in rows})
            turler = {}
            for r in rows:
                turler[r["tur"]] = turler.get(r["tur"], 0) + 1
            with open(os.path.join(PD, slug + ".json"), "w", encoding="utf-8") as fh:
                json.dump({"il": il, "slug": slug, "sayi": len(rows),
                           "sitedeSoylenen": reported, "ilceler": ilceler,
                           "turler": turler, "okullar": rows},
                          fh, ensure_ascii=False, separators=(",", ":"))
            summary.append({"il": il, "slug": slug, "sayi": len(rows),
                            "sitedeSoylenen": reported, "ilceSayisi": len(ilceler),
                            "turler": turler})
            grand += len(rows)
            print("   %-22s kayit=%5d  (site: %5d)  ilce=%2d"
                  % (il, len(rows), reported, len(ilceler)))

    summary.sort(key=lambda x: -x["sayi"])
    with open(os.path.join(D, "summary.json"), "w", encoding="utf-8") as fh:
        json.dump({"guncelleme": time.strftime("%Y-%m-%d"),
                   "kaynak": "MEB Ozel Ogretim Kurumlari Genel Mudurlugu",
                   "toplamKurum": grand, "iller": summary},
                  fh, ensure_ascii=False, indent=1)
    print("\n>> BITTI. %d il, %d kurum." % (len(summary), grand))


if __name__ == "__main__":
    main()
