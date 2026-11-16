# Apex Contour and Glow

The injectables website for Apex Hospital & Clinics, built on the same design as the Apex Surgery site (its `apex.css`, LINE Seed fonts and icons). The home page opens on the face planner: tap an area of the 3D face to see which treatments work there, what each costs and how long it lasts. Below it, the treatments sit on element-style tiles and the Skin layers section shows how deep each one works. Each of the 12 treatments has its own page, and Compare puts any two side by side.

All pages are built from `tools/tx_content.py` (treatment pages), `tools/site_content.py` (home page text, the treatment symbols and the skin layers) and `tools/layout.py` (prices, the compare facts and the face planner areas). `tools/skin_art.py` draws the skin layers, and `assets/css/cg.css` holds the styles this site adds to `apex.css`. Edit the text there, then run:

```
python3 tools/build_all.py
```

The build runs `tools/lint_copy.py` at the end and stops when any page, script or content string has wording that reads as AI-written. A line that has to stay as written goes in `tools/lint_allow.txt` with the reason after a `|` sign.

Earlier designs are kept in branches: the ball version in `ball-concept` and the gold mirror version in `lux-concept`.
