# Somewhere

**Live:** https://saimalshafi.github.io/somewhere/

Procedurally generated watercolor paintings of places that feel familiar.

Every painting is new. A building is designed from the architectural rules of a real place (plot widths, storey heights, materials, openings, roofs, signs, plants and street life), then set out in pencil, drawn in pen and painted in watercolour, live in the browser. Sixteen places are supported, from Shōwa-era Tokyo to the French Quarter of New Orleans.

- **Layers:** paint, ink and plants can be switched on and off.
- **Export:** SVG (the painting as vector shapes, sharp at any size), PNG (3300 × 4125 px) or GIF (the painting process).
- **Watch it being built:** a blueprint replay of how the painting was constructed: the dice rolls, the volumes, the projection, then the real paint job item by item.

## Run it

A static site: no build step, no dependencies, no server code.

- Serve the folder, e.g. `python3 -m http.server 8000`, then open http://localhost:8000
- (Opening `index.html` straight from disk also works in most browsers.)

## Publish on GitHub Pages

1. Push this folder to a repository.
2. Settings → Pages → Deploy from a branch → `main`, folder `/ (root)`.
3. The site appears at https://saimalshafi.github.io/somewhere/ (the link-preview tags in `index.html` point there; change them if you use another address).

## Feedback form

Messages from the About dialog are sent by [FormSubmit](https://formsubmit.co) to the address in `CONFIG.feedback` (stored base64-encoded so it does not appear as text on the page; it is still recoverable from the source). The first message sent triggers a one-time activation email from FormSubmit; click it, and FormSubmit then shows a random alias you can put in place of the address.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page, with a Content Security Policy |
| `css/basti.css` | Layout and theme |
| `js/app.js` | Page controller: generate, history, layers, export, blueprint, About dialog and feedback |
| `js/engine/core.js` | Random numbers, noise, perspective, watercolour washes, ink lines, foliage |
| `js/engine/styles.js` | The sixteen places and their rules |
| `js/engine/text.js` | Scripts, languages and sign wording per place |
| `js/engine/build.js` | The grammar (`generate`), walls, materials, ornament |
| `js/engine/build2.js` | Windows, doors, shopfronts, signs |
| `js/engine/build3.js` | Upper floors, balconies, galleries, bay windows, roofs, utilities |
| `js/engine/houses.js` | Shop and house types by period, what the rules allow (`floorsFor`), front boundaries |
| `js/engine/flora.js` | Trees, shrubs, climbers, pots |
| `js/engine/props.js` | Street furniture, placed by anchor slots |
| `js/engine/render.js` | Painter, time-sliced paint jobs, the paper texture, the painting animation |
| `js/engine/svg.js` | SVG export: records the painting as vector shapes, with the paper as an SVG filter |
| `js/engine/gif.js` | GIF export: records the painting animation and encodes it |
| `js/engine/blueprint.js` | Blueprint mode |

The engine files share globals and must load in the order listed in `index.html`. Fonts load from Google Fonts.
