# Apex Contour and Glow

The injectables website for Apex Hospital & Clinics, in Apex plum with gold trim. The home page opens on the face planner: tap an area of the 3D face to see which treatments work there, what each costs and how long it lasts. Each of the 12 treatments has its own page, and Compare puts any two side by side.

All pages are built from `tools/tx_content.py` (treatment pages) and `tools/layout.py` (prices, the compare facts and the face planner areas). Edit the text there, then run:

```
python3 tools/build_all.py
```

The build runs `tools/lint_copy.py` at the end and stops when any page, script or content string has wording that reads as AI-written. A line that has to stay as written goes in `tools/lint_allow.txt` with the reason after a `|` sign.

The ball version of the site is kept in the `ball-concept` branch.
