# -*- coding: utf-8 -*-
"""Belirli il/ilcelerdeki gercek lise kayitlarini listeler (sponsor secimi icin)."""
import json, os, sys
sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, "public", "data", "provinces")

WANT = [
    ("bursa", "NİLÜFER"),
    ("bursa", "OSMANGAZİ"),
    ("istanbul", "KADIKÖY"),
    ("ankara", "ÇANKAYA"),
    ("izmir", "BORNOVA"),
    ("antalya", "MURATPAŞA"),
]

for prov, ilce in WANT:
    d = json.load(open(os.path.join(P, prov + ".json"), encoding="utf-8"))
    rows = [s for s in d["okullar"] if s["ilce"] == ilce and "Lise" in s["tur"]]
    print("=== %s / %s — %d lise ===" % (prov, ilce, len(rows)))
    for s in rows[:8]:
        print("   ad: '%s'" % s["ad"])
        print("      tur: %s" % s["tur"])
    print()
