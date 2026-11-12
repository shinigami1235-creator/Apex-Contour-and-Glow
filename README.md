# Apex Contour and Glow

The injectables website for Apex Hospital & Clinics, set out as an evening at a ball. The home page opens on a curtain, and each treatment is a dance on the card with its own page.

Treatment pages are built from `tools/tx_content.py`. Edit the text there, then run:

```
python3 tools/build_tx.py
python3 tools/build_compare.py
python3 tools/lint_copy.py *.html
```

The last command checks the copy for wording that reads as AI-written.
