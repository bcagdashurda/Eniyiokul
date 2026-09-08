# -*- coding: utf-8 -*-
"""sponsors.ts icindeki yerlesimlerin veride gercekten var olup olmadigini dogrular."""
import json, os, re, sys
sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, "public", "data", "provinces")

ts = open(os.path.join(ROOT, "src", "lib", "sponsors.ts"), encoding="utf-8").read()
blocks = re.findall(
    r"province: '([^']+)',\s*ilce: '([^']+)',\s*ad: '([^']+)'", ts)
print("yerlesim: %d\n" % len(blocks))

for prov, ilce, ad in blocks:
    d = json.load(open(os.path.join(P, prov + ".json"), encoding="utf-8"))
    exact = [s for s in d["okullar"] if s["ad"] == ad and s["ilce"] == ilce]
    if exact:
        print("OK   %-10s %-14s %s" % (prov, ilce, ad))
        continue
    print("YOK  %-10s %-14s %s" % (prov, ilce, ad))
    # ayni ilcede benzer adaylar
    toks = [t for t in ad.split() if len(t) > 3][:3]
    cands = [s for s in d["okullar"] if s["ilce"] == ilce
             and sum(t in s["ad"] for t in toks) >= 2]
    for c in cands[:6]:
        print("       aday -> %s  [%s]" % (c["ad"], c["tur"]))
    if not cands:
        liseler = [s for s in d["okullar"] if s["ilce"] == ilce and "Lise" in s["tur"]]
        for c in liseler[:6]:
            print("       ilcede lise -> %s  [%s]" % (c["ad"], c["tur"]))
    print()
