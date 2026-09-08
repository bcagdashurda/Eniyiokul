# -*- coding: utf-8 -*-
"""GeoJSON il adlari ile MEB il adlarini eslestirir, eksikleri raporlar."""
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "data")

geo = json.load(open(os.path.join(D, "try_0.json"), encoding="utf-8"))
counts = json.load(open(os.path.join(D, "province_counts.json"), encoding="utf-8"))

geo_names = [f["properties"]["name"] for f in geo["features"]]


def up(s):
    """Turkce'ye duyarli buyuk harf."""
    return (s.replace("i", "İ").replace("ı", "I").replace("ğ", "Ğ")
             .replace("ü", "Ü").replace("ş", "Ş").replace("ö", "Ö")
             .replace("ç", "Ç").upper())


# GeoJSON adi -> MEB adi (farkli yazilanlar)
ALIAS = {
    "Afyon": "AFYONKARAHİSAR",
    "K.maras": "KAHRAMANMARAŞ",
    "Kahramanmaras": "KAHRAMANMARAŞ",
    "Icel": "MERSİN",
    "İçel": "MERSİN",
    "Zinguldak": "ZONGULDAK",
}

matched, missing = {}, []
for g in geo_names:
    key = ALIAS.get(g, up(g))
    if key in counts:
        matched[g] = key
    else:
        missing.append((g, key))

print("GeoJSON il: %d | MEB il: %d | eslesen: %d" % (len(geo_names), len(counts), len(matched)))
print("\n-- GeoJSON'da olup MEB'de bulunamayan --")
for g, k in missing:
    print("   %-16s -> arandi: %s" % (g, k))

used = set(matched.values())
print("\n-- MEB'de olup GeoJSON'a baglanmayan --")
for k in counts:
    if k not in used:
        print("   %s (%d kurum)" % (k, counts[k]))
