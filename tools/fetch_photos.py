# -*- coding: utf-8 -*-
"""
Sponsorlu okullarin fotograflarini okulonerisi.com uzerinden bulur ve indirir.

Yalnizca yerel prototipte kullanilmak uzere; dosyalar public/img/schools/<klasor>/
altina yazilir. Bulunamayan okul icin arayuz zaten armaya donuyor.

  cover.jpg      -> liste/vitrin karti  (16:9)
  01..03.jpg     -> profil galerisi     (3:2)
"""
import io
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

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "img", "schools")
os.makedirs(OUT, exist_ok=True)

BASE = "https://okulonerisi.com"
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE
H = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept-Language": "tr-TR,tr;q=0.9",
    "Referer": BASE + "/",
}

# (klasor, il-slug, ilce, MEB adi)
TARGETS = [
    ("bursa-arena",      "bursa",    "nilufer",   "ÖZEL BURSA ARENA YUSUF ZİYA KARAKUŞ ANADOLU LİSESİ"),
    ("cekirge-bilimsel", "bursa",    "osmangazi", "ÖZEL ÇEKİRGE BİLİMSEL FARKLILIK FEN LİSESİ"),
    ("anakent-koleji",   "istanbul", "kadikoy",   "ÖZEL ANAKENT KOLEJİ ANADOLU LİSESİ"),
    ("baskent-ayseabla", "ankara",   "cankaya",   "BAŞKENT ÜNİVERSİTESİ ÖZEL AYŞEABLA FEN LİSESİ"),
    ("arkas-piri-reis",  "izmir",    "bornova",   "ÖZEL ARKAS PİRİ REİS ANADOLU LİSESİ"),
    ("antalya-aci",      "antalya",  "muratpasa", "ÖZEL ANTALYA AÇI FEN LİSESİ"),
]

STOP = {"ozel", "anadolu", "lisesi", "fen", "koleji", "okulu", "ilkokulu",
        "ortaokulu", "anaokulu", "universitesi", "vakfi", "turk", "ve"}


def get(url, tries=3, binary=False):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=H)
            with urllib.request.urlopen(req, timeout=60, context=CTX) as r:
                b = r.read()
                return b if binary else b.decode("utf-8", "replace")
        except Exception as e:
            if i == tries - 1:
                print("   ! %s -> %s" % (url, e))
                return None
            time.sleep(1.5 * (i + 1))
    return None


def norm(s):
    s = (s or "").replace("ı", "i").replace("İ", "i").replace("I", "i")
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9 ]", " ", s.lower())


def tokens(s):
    return {t for t in norm(s).split() if len(t) > 2 and t not in STOP}


CARD = re.compile(
    r'href="(https://okulonerisi\.com/okullar/[^"]+?-(\d+))"[^>]*class="stretched-link.*?'
    r'<img src="(https://okulonerisi\.com/storage/campuses/[^"]+)"[^>]*alt="([^"]*?) fotoğrafı"',
    re.S,
)


def listing(il, page=1):
    u = "%s/okullar/%s?page=%d" % (BASE, il, page)
    html = get(u)
    if not html:
        return []
    out = []
    for m in CARD.finditer(html):
        out.append({"url": m.group(1), "id": m.group(2),
                    "img": m.group(3), "ad": unescape(m.group(4))})
    return out


def collect(il, max_pages=12):
    seen, all_rows = set(), []
    for p in range(1, max_pages + 1):
        rows = listing(il, p)
        if not rows:
            break
        fresh = [r for r in rows if r["id"] not in seen]
        if not fresh:
            break
        for r in fresh:
            seen.add(r["id"])
        all_rows.extend(fresh)
    return all_rows


def best(rows, meb_ad, ilce):
    want = tokens(meb_ad)
    ilce_n = norm(ilce).strip()
    scored = []
    for r in rows:
        got = tokens(r["ad"])
        if not got:
            continue
        inter = len(want & got)
        score = inter / max(1, len(want))
        if ilce_n and ilce_n in norm(r["url"]):
            score += 0.15
        scored.append((score, inter, r))
    scored.sort(key=lambda x: (-x[0], -x[1]))
    return scored[:4]


GALLERY = re.compile(r'(https://okulonerisi\.com/storage/(?:campuses|galleries|schools)/[^"\']+?\.(?:webp|jpg|jpeg|png))')


def detail_images(url):
    html = get(url)
    if not html:
        return []
    urls = []
    for m in GALLERY.finditer(html):
        u = m.group(1)
        if u not in urls:
            urls.append(u)
    return urls


def save(url, path):
    data = get(url, binary=True)
    if not data or len(data) < 2000:
        return False
    with open(path, "wb") as f:
        f.write(data)
    return True


def main():
    cache = {}
    report = []
    for folder, il, ilce, meb in TARGETS:
        print("\n=== %s  (%s/%s)" % (meb, il, ilce))
        if il not in cache:
            print("   liste cekiliyor: %s" % il)
            cache[il] = collect(il)
            print("   %d okul karti" % len(cache[il]))
        cands = best(cache[il], meb, ilce)
        if not cands or cands[0][0] < 0.3:
            print("   BULUNAMADI. En yakin adaylar:")
            for s, i, r in cands:
                print("      %.2f  %s" % (s, r["ad"]))
            report.append((folder, meb, None, 0))
            continue

        s, _, r = cands[0]
        print("   eslesme %.2f -> %s" % (s, r["ad"]))
        print("   %s" % r["url"])

        d = os.path.join(OUT, folder)
        os.makedirs(d, exist_ok=True)

        imgs = detail_images(r["url"]) or []
        # kart gorseli her zaman ilk sirada
        if r["img"] in imgs:
            imgs.remove(r["img"])
        imgs.insert(0, r["img"])
        print("   %d gorsel bulundu" % len(imgs))

        names = ["cover.webp", "01.webp", "02.webp", "03.webp"]
        got = 0
        for u, name in zip(imgs, names):
            if save(u, os.path.join(d, name)):
                got += 1
                print("      + %s" % name)
        report.append((folder, meb, r["ad"], got))

    print("\n================ OZET ================")
    for folder, meb, found, got in report:
        print("%-18s %-3s %s" % (folder, got, found or "BULUNAMADI"))


if __name__ == "__main__":
    main()
