# -*- coding: utf-8 -*-
import json, os, re, sys
sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public", "data")

geo = json.load(open(os.path.join(PUB, "tr-provinces.json"), encoding="utf-8"))
names = sorted(f["properties"]["name"] for f in geo["features"])
print("--- GeoJSON'da gecen tum il adlari (81) ---")
print(", ".join(names))

ts = open(os.path.join(ROOT, "src", "lib", "provinces.ts"), encoding="utf-8").read()
mine = set(re.findall(r"geo: '([^']+)'", ts))
print("\n--- provinces.ts'de olup GeoJSON'da OLMAYAN ---")
print(sorted(mine - set(names)))
print("\n--- GeoJSON'da olup provinces.ts'de OLMAYAN ---")
print(sorted(set(names) - mine))

# MEB ilce toplami
tot = 0
for fn in os.listdir(os.path.join(PUB, "provinces")):
    d = json.load(open(os.path.join(PUB, "provinces", fn), encoding="utf-8"))
    tot += len(d["ilceler"])
print("\nMEB'in okul kaydi bulunan ilce sayisi (toplam): %d" % tot)
print("Kaynak GeoJSON'daki toplam ilce: 928")
