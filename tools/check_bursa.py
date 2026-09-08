# -*- coding: utf-8 -*-
import json, os, sys
sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, "public", "data")

d = json.load(open(os.path.join(P, "districts", "bursa.json"), encoding="utf-8"))
print("ilce poligonu: %d" % d["ilceSayisi"])
print("%-22s %-22s %6s %s" % ("AD", "KAYNAK AD", "OKUL", "ESLESTI"))
for f in d["features"]:
    pr = f["properties"]
    print("%-22s %-22s %6d %s" % (pr["ad"], pr["kaynakAd"], pr["okulSayisi"], pr["eslesti"]))

meb = json.load(open(os.path.join(P, "provinces", "bursa.json"), encoding="utf-8"))
print("\nMEB ilceleri (%d): %s" % (len(meb["ilceler"]), ", ".join(meb["ilceler"])))

geo_names = {f["properties"]["ad"] for f in d["features"]}
print("\nMEB'de olup poligonda YOK:", sorted(set(meb["ilceler"]) - geo_names))

# Merkez koordinatlarini kontrol et (dogru yerde mi)
print("\n--- merkez koordinatlari (lon, lat) ---")
for f in d["features"][:20]:
    pr = f["properties"]
    print("  %-20s %s" % (pr["ad"], pr["merkez"]))
