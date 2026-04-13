# Infinite Wild

An infinite, deterministic wilderness explorer. Arrive at random coordinates, read your arrival description, and share your coordinates with others.

## File structure

```
infinite-wild/
├── index.html       ← Arrive page
├── explore.html     ← Explore / search page
├── css/
│   └── style.css
└── js/
    ├── world.js     ← Biomes, weather, noise, coordinate logic
    ├── map.js       ← Canvas renderer, pan/zoom, markers
    ├── storage.js   ← localStorage visited registry
    ├── ai.js        ← Preset-based arrival descriptions (no server needed)
    ├── arrive.js    ← Arrive page controller
    └── explore.js   ← Explore page controller
```

## Usage

No build step, no server, no API key required. Just open `index.html` in a browser, or serve the folder with any static host (GitHub Pages, etc.).

## Notes

- Coordinates are truly infinite (no cap)
- Same coordinates always produce the same biome, weather, and description
- Visited locations are stored in localStorage (per browser)
- Descriptions are generated deterministically from biome and weather presets — no network requests
