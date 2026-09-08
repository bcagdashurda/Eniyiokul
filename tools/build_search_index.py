# -*- coding: utf-8 -*-
"""
Okul adı araması için sıkıştırılmış indeks üretir.

Tüm il dosyalarını peşin indirmek 2,9 MB'a mal oluyordu. Bunun yerine yalnız
arama için gereken alanlar (ad, il, ilçe, kademe) dizi olarak yazılıyor;
dosya arama kutusuna ilk yazışta bir kez yükleniyor.

Cikti: public/data/search-index.json
"""
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public", "data")


def kademe(tur):
    t = tur.lower()
    if "okul öncesi" in t or "anaokul" in t:
        return 0
    if "ilkokul" in t:
        return 1
    if "ortaokul" in t:
        return 2
    if "lise" in t:
        return 3
    return 4


def main():
    iller, okullar = [], []
    idx = {}
    files = sorted(os.listdir(os.path.join(PUB, "provinces")))
    for fn in files:
        if not fn.endswith(".json"):
            continue
        d = json.load(open(os.path.join(PUB, "provinces", fn), encoding="utf-8"))
        slug = d["slug"]
        if slug not in idx:
            idx[slug] = len(iller)
            iller.append(slug)
        i = idx[slug]
        for s in d["okullar"]:
            okullar.append([s["ad"], i, s["ilce"], kademe(s["tur"])])

    out = os.path.join(PUB, "search-index.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump({"iller": iller, "okullar": okullar},
                  f, ensure_ascii=False, separators=(",", ":"))

    size = os.path.getsize(out)
    print("il: %d | okul: %d | dosya: %.2f MB"
          % (len(iller), len(okullar), size / 1024 / 1024))


if __name__ == "__main__":
    main()
