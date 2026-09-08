# -*- coding: utf-8 -*-
"""
Ham veriyi (data/) siteye servis edilebilir hale getirir (public/data/).

- tr-provinces.json : il sinirlari (GeoJSON)
- summary.json      : harita ozeti; MEB listesinde olmayan Ardahan 0 ile eklenir
- provinces/*.json  : il basina okul listesi (tembel yuklenir)
"""
import json
import os
import shutil
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data")
DST = os.path.join(ROOT, "public", "data")
os.makedirs(os.path.join(DST, "provinces"), exist_ok=True)

# 1) GeoJSON
shutil.copyfile(os.path.join(SRC, "try_0.json"), os.path.join(DST, "tr-provinces.json"))
geo = json.load(open(os.path.join(DST, "tr-provinces.json"), encoding="utf-8"))
print("geojson il: %d" % len(geo["features"]))

# 2) Il dosyalari
n = 0
for f in os.listdir(os.path.join(SRC, "provinces")):
    if f.endswith(".json"):
        shutil.copyfile(os.path.join(SRC, "provinces", f),
                        os.path.join(DST, "provinces", f))
        n += 1

# MEB kaynaginda Ardahan yok -> durust bir bos kayit
ardahan = {"il": "ARDAHAN", "slug": "ardahan", "sayi": 0, "sitedeSoylenen": 0,
           "ilceler": [], "turler": {}, "okullar": []}
with open(os.path.join(DST, "provinces", "ardahan.json"), "w", encoding="utf-8") as fh:
    json.dump(ardahan, fh, ensure_ascii=False, separators=(",", ":"))
n += 1
print("il dosyasi: %d" % n)

# 3) Ozet
summary = json.load(open(os.path.join(SRC, "summary.json"), encoding="utf-8"))
slugs = {i["slug"] for i in summary["iller"]}
if "ardahan" not in slugs:
    summary["iller"].append({"il": "ARDAHAN", "slug": "ardahan", "sayi": 0,
                             "sitedeSoylenen": 0, "ilceSayisi": 0, "turler": {}})
summary["iller"].sort(key=lambda x: -x["sayi"])
summary["kaynakUrl"] = "https://ookgm.meb.gov.tr/kurumlar.php"
summary["not"] = ("Ardahan MEB'in il listesinde yer almadigi icin 0 kurum ile "
                  "gosterilmektedir.")

# Tur kirilimini ulke geneli icin topla
tur_total = {}
for il in summary["iller"]:
    for t, c in il.get("turler", {}).items():
        tur_total[t] = tur_total.get(t, 0) + c
summary["turDagilimi"] = dict(sorted(tur_total.items(), key=lambda x: -x[1]))

with open(os.path.join(DST, "summary.json"), "w", encoding="utf-8") as fh:
    json.dump(summary, fh, ensure_ascii=False, separators=(",", ":"))

print("il: %d | toplam kurum: %d" % (len(summary["iller"]), summary["toplamKurum"]))
print("tur sayisi: %d" % len(tur_total))
size = sum(os.path.getsize(os.path.join(dp, f))
           for dp, _, fs in os.walk(DST) for f in fs)
print("public/data: %.2f MB" % (size / 1024 / 1024))
