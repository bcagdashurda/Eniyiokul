# -*- coding: utf-8 -*-
"""
Ilce sinirlarini hazirlar: geometri + isim + il baglantisi.

SADELESTIRME NOTU
-----------------
Her poligonu ayri ayri Douglas-Peucker ile sadelestirmek komsu ilcelerin
ORTAK kenarlarini farkli sadelestirir; aralarda ince bosluk ve binisme olusur.
Bunun yerine tum koordinatlar ayni izgaraya yuvarlanir: ortak kosem noktalari
birebir ayni kaldigi icin ilceler kusursuz sekilde birbirine oturur.

Kaynak: ttezer/turkiye-harita-verisi
  dist/geojson/districts.geojson  (973 poligon)
  dist/json/districts.json        (ad, plaka kodu, merkez)

Cikti: public/data/districts/<il-slug>.json  (il basina, tembel yuklenir)
"""
import json
import os
import re
import sys
import unicodedata
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
PUB = os.path.join(ROOT, "public", "data")
OUT = os.path.join(PUB, "districts")
os.makedirs(OUT, exist_ok=True)

# Izgara adimi (derece). ~220 m — il olceginde gozle ayirt edilmez,
# nokta sayisini ciddi dusurur ve topolojiyi korur.
GRID = 0.002
Q = 1.0 / GRID
PREC = 4


def norm(s):
    s = (s or "").replace("ı", "i").replace("İ", "i").replace("I", "i")
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", s.lower())


def rings_of(geom):
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    if geom["type"] == "MultiPolygon":
        return geom["coordinates"]
    return []


def snap_ring(ring):
    """Izgaraya yuvarla, ardisik tekrarlari at, halkayi kapat."""
    out = []
    for p in ring:
        s = (round(p[0] * Q) / Q, round(p[1] * Q) / Q)
        if not out or out[-1] != s:
            out.append(s)
    if len(out) > 1 and out[0] == out[-1]:
        out.pop()
    if len(out) < 3:
        return None
    return [[round(x, PREC), round(y, PREC)] for x, y in out] + \
           [[round(out[0][0], PREC), round(out[0][1], PREC)]]


def snap_geom(geom):
    polys = []
    for poly in rings_of(geom):
        rr = [r for r in (snap_ring(ring) for ring in poly) if r]
        if rr:
            polys.append(rr)
    if not polys:
        return None
    if len(polys) == 1:
        return {"type": "Polygon", "coordinates": polys[0]}
    return {"type": "MultiPolygon", "coordinates": polys}


def npoints(geom):
    if not geom:
        return 0
    return sum(len(r) for poly in rings_of(geom) for r in poly)


def main():
    ts = open(os.path.join(ROOT, "src", "lib", "provinces.ts"), encoding="utf-8").read()
    plate2slug = {}
    for m in re.finditer(r"plate: (\d+),[^}]*?slug: '([^']+)'", ts):
        plate2slug[int(m.group(1))] = m.group(2)
    print("plaka -> slug: %d" % len(plate2slug))

    geo = json.load(open(os.path.join(DATA, "districts-v2.geojson"), encoding="utf-8"))
    meta = json.load(open(os.path.join(DATA, "districts-names.json"), encoding="utf-8"))
    by_id = {d["id"]: d for d in meta}
    print("geometri: %d | isim kaydi: %d" % (len(geo["features"]), len(by_id)))

    meb = {}
    for fn in os.listdir(os.path.join(PUB, "provinces")):
        d = json.load(open(os.path.join(PUB, "provinces", fn), encoding="utf-8"))
        meb[d["slug"]] = d

    buckets = defaultdict(list)
    for f in geo["features"]:
        m = by_id.get(f["properties"].get("id"))
        if not m:
            continue
        slug = plate2slug.get(int(m["plate_code"]))
        if slug:
            buckets[slug].append((m, f["geometry"]))

    tot_in = tot_out = matched = 0
    missing = []
    for slug, items in sorted(buckets.items()):
        p = meb.get(slug, {})
        meb_names = p.get("ilceler", [])
        by_norm = {norm(x): x for x in meb_names}
        counts = {}
        for s in p.get("okullar", []):
            counts[s["ilce"]] = counts.get(s["ilce"], 0) + 1

        feats = []
        for m, geom in items:
            tot_in += npoints(geom)
            sg = snap_geom(geom)
            if not sg:
                continue
            tot_out += npoints(sg)

            mn = by_norm.get(norm(m["name"]))
            if not mn:
                for a in m.get("aliases") or []:
                    mn = by_norm.get(norm(a))
                    if mn:
                        break
            # MEB, buyuksehir olmayan illerin merkez ilcesine "MERKEZ" der.
            if not mn and "MERKEZ" in by_norm.values():
                if norm(m["name"]) in (norm(p.get("il", "")), "merkez"):
                    mn = "MERKEZ"
            if mn:
                matched += 1

            feats.append({
                "type": "Feature",
                "properties": {
                    "ad": mn or m["name"],
                    "kaynakAd": m["name"],
                    "eslesti": bool(mn),
                    "okulSayisi": counts.get(mn, 0) if mn else 0,
                    "merkez": [round(m["centroid"]["lon"], 4),
                               round(m["centroid"]["lat"], 4)],
                },
                "geometry": sg,
            })

        covered = {f["properties"]["ad"] for f in feats if f["properties"]["eslesti"]}
        for x in meb_names:
            if x not in covered:
                missing.append("%s/%s" % (slug, x))

        feats.sort(key=lambda f: -f["properties"]["okulSayisi"])
        with open(os.path.join(OUT, slug + ".json"), "w", encoding="utf-8") as fh:
            json.dump({"type": "FeatureCollection", "il": slug,
                       "ilceSayisi": len(feats), "features": feats},
                      fh, ensure_ascii=False, separators=(",", ":"))

    files = os.listdir(OUT)
    sizes = [(f, os.path.getsize(os.path.join(OUT, f))) for f in files]
    sizes.sort(key=lambda x: -x[1])
    total = sum(s for _, s in sizes)
    print("nokta: %d -> %d (%%%.1f)" % (tot_in, tot_out, 100 * tot_out / tot_in))
    print("MEB adiyla eslesen ilce: %d / 973" % matched)
    print("poligonu bulunamayan MEB ilcesi: %d %s" % (len(missing), missing[:6]))
    print("dosya: %d | toplam %.2f MB" % (len(files), total / 1024 / 1024))
    print("en buyuk 5:")
    for f, s in sizes[:5]:
        print("   %-20s %6.1f KB" % (f, s / 1024))


if __name__ == "__main__":
    main()
