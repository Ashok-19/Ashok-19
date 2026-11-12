# Dino sprite

The dino in every image is drawn from the SVG files in this folder:

| File | Used for |
| --- | --- |
| `stand.svg` | standing on a contribution tile, the footer |
| `run-1.svg`, `run-2.svg` | the two running frames in the header |
| `jump.svg` | mid-air in the header and on the contribution graph |

The current files are a placeholder dino. To use a different dino, replace
these files with your own SVGs and push to `main`; the workflow rebuilds every
image. Any pose file you delete falls back to `stand.svg`, so a single
`stand.svg` is enough.

Requirements for a replacement:

- The dino faces **right** (the graph mirrors it when it jumps left).
- Its feet touch the bottom of the `viewBox`.
- Colours are converted for light and dark mode: dark fills become the text
  colour and light fills (like an eye highlight) become the background.

If the artwork you use comes with a license that asks for attribution (for
example a BSD license), add that notice to this folder and credit it in the
main README.
