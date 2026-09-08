# -*- coding: utf-8 -*-
import json, os, sys, collections
sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
g = json.load(open(os.path.join(ROOT, "data", "districts-v2.geojson"), encoding="utf-8"))
print("features:", len(g["features"]))
f = g["features"][0]
print("geometry:", f["geometry"]["type"])
print("properties:", json.dumps(f["properties"], ensure_ascii=False, indent=1))
print("\n--- 6 ornek ---")
for f in g["features"][:6]:
    print(f["properties"])
# il dagilimi
key = None
for k in g["features"][0]["properties"]:
    if "il" in k.lower() or "prov" in k.lower() or "city" in k.lower():
        key = k
        break
print("\nil anahtari tahmini:", key)
if key:
    c = collections.Counter(x["properties"].get(key) for x in g["features"])
    print("farkli il degeri:", len(c))
    print(list(c.items())[:10])
