# -*- coding: utf-8 -*-
"""
Il ve ilce sinirlarini TEK kaynaktan uretir.

Onceki surumde il sinirlari baska bir veri setinden geliyordu ve ilce
sinirlariyla kenarlarda tutmuyordu. Burada il sinirlari, ilce poligonlarinin
BIRLESIMINDEN turetiliyor; boylece iki katman birebir cakisir.

Yontem:
  1) Tum koordinatlar ayni izgaraya yuvarlanir  -> komsu ilcelerin ortak
     kenarlari birebir ayni noktalardan olusur (topoloji korunur).
  2) Il icindeki ilcelerin kenarlari toplanir; iki kez (ters yonlerde)
     gecen kenar ic kenardir ve atilir.  Kalan kenarlar il sinirini verir.
  3) Kalan kenarlar halkalara dizilir.

Cikti:
  public/data/tr-provinces.json     (il sinirlari, ilcelerden turetilmis)
  public/data/districts/<slug>.json (ilce sinirlari, ayni izgarada)
"""
import json
import os
import re
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
PUB = os.path.join(ROOT, "public", "data")
DOUT = os.path.join(PUB, "districts")
os.makedirs(DOUT, exist_ok=True)

# Izgara adimi (derece). ~150 m: bu olcekte gozle ayirt edilmez ama
# nokta sayisini ciddi dusurur ve ortak kenarlari birebir esitler.
GRID = 0.0015
Q = 1.0 / GRID

# Birlestirme sonrasi sadelestirme toleranslari (izgara birimi).
# Ilce sinirlari il olceginde yakindan gorulur -> daha sik nokta.
D_TOL = 1.1     # ~165 m
P_TOL = 2.6     # ~390 m (il sinirlari yalnizca ulke olceginde gorunur)


def snap(p):
    return (round(p[0] * Q), round(p[1] * Q))


def unsnap(p):
    return [round(p[0] * GRID, 5), round(p[1] * GRID, 5)]


def snap_ring(ring):
    """Izgaraya yuvarlar, ardisik tekrarlari atar, halkayi kapatir."""
    out = []
    for p in ring:
        s = snap(p)
        if not out or out[-1] != s:
            out.append(s)
    if len(out) > 1 and out[0] == out[-1]:
        out.pop()
    return out


def rings_of(geom):
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    if geom["type"] == "MultiPolygon":
        return geom["coordinates"]
    return []


def snap_geom(geom):
    polys = []
    for poly in rings_of(geom):
        rr = []
        for ring in poly:
            s = snap_ring(ring)
            if len(s) >= 3:
                rr.append(s)
        if rr:
            polys.append(rr)
    return polys  # [[ring(snapped ints), ...], ...]


def _perp(p, a, b):
    px, py = p
    ax, ay = a
    bx, by = b
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
    t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    return ((px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2) ** 0.5


def simplify_ring(ring, tol):
    """Douglas-Peucker (izgara birimi cinsinden tolerans)."""
    if len(ring) < 8:
        return ring
    pts = ring + [ring[0]]
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        dmax, idx = 0.0, i
        for k in range(i + 1, j):
            d = _perp(pts[k], pts[i], pts[j])
            if d > dmax:
                dmax, idx = d, k
        if dmax > tol:
            keep[idx] = True
            stack.append((i, idx))
            stack.append((idx, j))
    out = [p for p, k in zip(pts, keep) if k]
    if len(out) > 1 and out[0] == out[-1]:
        out.pop()
    return out if len(out) >= 3 else ring


def simplify_polys(polys, tol):
    out = []
    for poly in polys:
        rr = [simplify_ring(r, tol) for r in poly]
        rr = [r for r in rr if len(r) >= 3]
        if rr:
            out.append(rr)
    return out


def to_geojson(polys):
    """Ic gosterimden GeoJSON geometrisine."""
    out = []
    for poly in polys:
        rr = [[unsnap(p) for p in ring] + [unsnap(ring[0])] for ring in poly]
        out.append(rr)
    if not out:
        return None
    if len(out) == 1:
        return {"type": "Polygon", "coordinates": out[0]}
    return {"type": "MultiPolygon", "coordinates": out}


def dissolve(polys_list):
    """Poligon kumesini birlestirir: ic kenarlari atip kalanlari halkalar."""
    edges = set()
    for polys in polys_list:
        for poly in polys:
            for ring in poly:
                m = len(ring)
                for i in range(m):
                    a, b = ring[i], ring[(i + 1) % m]
                    if a == b:
                        continue
                    if (b, a) in edges:
                        edges.discard((b, a))   # ic kenar: iki kez gecti
                    else:
                        edges.add((a, b))

    # Kalan kenarlari halkalara diz.
    # Sikisma noktalarinda (bir dugumden birden fazla cikis) ya da kiyi
    # artiklarinda zincir kopabilir; o durumda halka basa baglanarak
    # kapatilir, kenarlar kaybedilmez.
    nxt = defaultdict(list)
    for a, b in edges:
        nxt[a].append(b)

    rings = []
    starts = [k for k in nxt if nxt[k]]
    for start in starts:
        while nxt[start]:
            ring = [start]
            cur = nxt[start].pop()
            guard = 0
            while cur != start:
                ring.append(cur)
                opts = nxt.get(cur)
                if not opts:
                    break            # zincir koptu -> halkayi oldugu gibi kapat
                cur = opts.pop()
                guard += 1
                if guard > 200000:
                    break
            if len(ring) >= 3:
                rings.append(ring)

    if not rings:
        return []

    # En buyuk alanli halka dis sinir; digerleri delik ya da ayri parca.
    def area(r):
        a = 0.0
        for i in range(len(r)):
            x1, y1 = r[i]
            x2, y2 = r[(i + 1) % len(r)]
            a += x1 * y2 - x2 * y1
        return abs(a) / 2

    rings.sort(key=area, reverse=True)
    # Cok kucuk artik halkalari at (kiyi/ada gurultusu), kalanlari
    # ayri poligon olarak birak.
    return [[r] for r in rings if area(r) > 6]


def main():
    ts = open(os.path.join(ROOT, "src", "lib", "provinces.ts"), encoding="utf-8").read()
    plate2 = {}
    for m in re.finditer(r"plate: (\d+), geo: '([^']+)', meb: '[^']*', slug: '([^']+)'", ts):
        plate2[int(m.group(1))] = (m.group(2), m.group(3))
    if len(plate2) != 81:
        # provinces.ts satir duzeni degismis olabilir - daha esnek yakala
        plate2 = {}
        for m in re.finditer(r"plate: (\d+),[^}]*?geo: '([^']+)'[^}]*?slug: '([^']+)'", ts):
            plate2[int(m.group(1))] = (m.group(2), m.group(3))
    print("plaka eslemesi: %d" % len(plate2))

    geo = json.load(open(os.path.join(DATA, "districts-v2.geojson"), encoding="utf-8"))
    meta = json.load(open(os.path.join(DATA, "districts-names.json"), encoding="utf-8"))
    by_id = {d["id"]: d for d in meta}

    meb = {}
    for fn in os.listdir(os.path.join(PUB, "provinces")):
        d = json.load(open(os.path.join(PUB, "provinces", fn), encoding="utf-8"))
        meb[d["slug"]] = d

    # Ilceleri ile grupla + izgaraya oturt
    buckets = defaultdict(list)
    raw_pts = snap_pts = 0
    for f in geo["features"]:
        m = by_id.get(f["properties"].get("id"))
        if not m:
            continue
        pair = plate2.get(int(m["plate_code"]))
        if not pair:
            continue
        raw_pts += sum(len(r) for poly in rings_of(f["geometry"]) for r in poly)
        sp = snap_geom(f["geometry"])
        if not sp:
            continue
        snap_pts += sum(len(r) for poly in sp for r in poly)
        buckets[pair[1]].append((m, sp))

    print("nokta: %d -> %d (%%%.1f)" % (raw_pts, snap_pts, 100 * snap_pts / raw_pts))

    # --- Ilce dosyalari ---
    total_d = 0
    for slug, items in buckets.items():
        p = meb.get(slug, {})
        counts = {}
        for s in p.get("okullar", []):
            counts[s["ilce"]] = counts.get(s["ilce"], 0) + 1
        names = {_norm(x): x for x in p.get("ilceler", [])}

        feats = []
        for m, sp in items:
            g = to_geojson(simplify_polys(sp, D_TOL))
            if not g:
                continue
            mn = names.get(_norm(m["name"]))
            if not mn:
                for a in m.get("aliases") or []:
                    mn = names.get(_norm(a))
                    if mn:
                        break
            if not mn and "MERKEZ" in names.values():
                if _norm(m["name"]) in (_norm(p.get("il", "")), "merkez"):
                    mn = "MERKEZ"
            feats.append({
                "type": "Feature",
                "properties": {
                    "ad": mn or m["name"],
                    "kaynakAd": m["name"],
                    "eslesti": bool(mn),
                    "okulSayisi": counts.get(mn, 0) if mn else 0,
                    "merkez": [round(m["centroid"]["lon"], 4), round(m["centroid"]["lat"], 4)],
                },
                "geometry": g,
            })
        feats.sort(key=lambda f: -f["properties"]["okulSayisi"])
        total_d += len(feats)
        with open(os.path.join(DOUT, slug + ".json"), "w", encoding="utf-8") as fh:
            json.dump({"type": "FeatureCollection", "il": slug,
                       "ilceSayisi": len(feats), "features": feats},
                      fh, ensure_ascii=False, separators=(",", ":"))

    # --- Il sinirlari: ilcelerin birlesimi ---
    pf = []
    for plate, (geoname, slug) in sorted(plate2.items()):
        items = buckets.get(slug, [])
        if not items:
            print("  ! ilce yok:", slug)
            continue
        merged = dissolve([sp for _, sp in items])
        g = to_geojson(simplify_polys(merged, P_TOL))
        if not g:
            print("  ! birlestirilemedi:", slug)
            continue
        pf.append({
            "type": "Feature",
            "properties": {"name": geoname, "slug": slug, "plate": plate},
            "geometry": g,
        })

    with open(os.path.join(PUB, "tr-provinces.json"), "w", encoding="utf-8") as fh:
        json.dump({"type": "FeatureCollection", "features": pf},
                  fh, ensure_ascii=False, separators=(",", ":"))

    ps = os.path.getsize(os.path.join(PUB, "tr-provinces.json"))
    ds = sum(os.path.getsize(os.path.join(DOUT, f)) for f in os.listdir(DOUT))
    print("il: %d (%.2f MB) | ilce: %d (%.2f MB)"
          % (len(pf), ps / 1024 / 1024, total_d, ds / 1024 / 1024))


def _norm(s):
    import unicodedata
    s = (s or "").replace("ı", "i").replace("İ", "i").replace("I", "i")
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", s.lower())


if __name__ == "__main__":
    main()
