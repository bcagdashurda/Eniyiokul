# -*- coding: utf-8 -*-
import json, os, sys
sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "public", "data", "provinces")
for slug in ["bursa", "istanbul", "ankara", "izmir", "antalya"]:
    d = json.load(open(os.path.join(D, slug + ".json"), encoding="utf-8"))
    liseler = [s for s in d["okullar"] if "Lise" in s["tur"]]
    print("=== %s | %d okul | %d lise | ilce: %d ===" % (d["il"], d["sayi"], len(liseler), len(d["ilceler"])))
    for s in liseler[:5]:
        print("   %-60s | %-30s | %s" % (s["ad"][:60], s["tur"][:30], s["ilce"]))
    print()
