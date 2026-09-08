# -*- coding: utf-8 -*-
import json, os, sys
sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(ROOT, "data", "lvl2-raw.geojson")
g = json.load(open(p, encoding="utf-8"))
print("type:", g.get("type"), "| features:", len(g["features"]))
f = g["features"][0]
print("geometry:", f["geometry"]["type"])
print("properties keys:", list(f["properties"].keys()))
print(json.dumps(f["properties"], ensure_ascii=False, indent=1)[:900])
print("\n--- 5 ornek property ---")
for f in g["features"][:5]:
    pr = f["properties"]
    print({k: pr.get(k) for k in list(pr.keys())[:8]})
