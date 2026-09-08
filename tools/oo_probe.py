# -*- coding: utf-8 -*-
"""okulonerisi.com arama ucunu dogrula."""
import re, ssl, sys, urllib.parse, urllib.request
sys.stdout.reconfigure(encoding="utf-8")

CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
     "Accept-Language": "tr-TR,tr;q=0.9", "Referer": "https://okulonerisi.com/"}

def get(u):
    try:
        return urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=60, context=CTX).read().decode("utf-8", "replace")
    except Exception as e:
        return "ERR %s" % e

def total(h):
    m = re.search(r'Toplam\s*<span[^>]*>(\d+)</span>\s*okul', h)
    return m.group(1) if m else "?"

NAME = re.compile(r'alt="([^"]*?) fotoğrafı"')

def show(u, limit=6):
    h = get(u)
    if h.startswith("ERR"):
        print("ERR", u); return
    names = NAME.findall(h)
    print("toplam=%-5s kart=%-3d  %s" % (total(h), len(names), u))
    for n in names[:limit]:
        print("      -", n)

Q = urllib.parse.quote
show("https://okulonerisi.com/okullar?q=" + Q("Arena Yusuf Ziya"))
show("https://okulonerisi.com/okullar?q=" + Q("Anakent Koleji"))
show("https://okulonerisi.com/okullar?q=" + Q("Ayşeabla"))
show("https://okulonerisi.com/okullar?q=" + Q("Arkas Piri Reis"))
show("https://okulonerisi.com/okullar?q=" + Q("Antalya Açı"))
show("https://okulonerisi.com/okullar?q=" + Q("Çekirge Bilimsel"))

print("\n--- ozel okul filtresi denemeleri (bursa) ---")
for v in ["Özel", "ozel", "private", "1", "Özel Okul"]:
    u = "https://okulonerisi.com/okullar/bursa?city=16&types%5B%5D=" + Q(v)
    h = get(u)
    print("   types[]=%-10s toplam=%s" % (v, total(h) if not h.startswith("ERR") else "ERR"))

print("\n--- filtre secenekleri (checkbox degerleri) ---")
h = get("https://okulonerisi.com/okullar/bursa")
for m in list(re.finditer(r'<input[^>]*type="checkbox"[^>]*>', h))[:14]:
    print("  ", m.group(0)[:170])
