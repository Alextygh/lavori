# Infinite Wild

An infinite, deterministic wilderness explorer. Arrive at random coordinates, read your arrival description, and see where other visitors have been.

## File structure

```
infinite-wild/
├── index.html       ← Arrive page
├── explore.html     ← Explore / search page
├── css/
│   └── style.css
└── js/
    ├── config.js    ← YOUR GIST ID AND TOKEN GO HERE
    ├── world.js     ← Biomes, weather, noise, coordinate logic
    ├── map.js       ← Canvas renderer, pan/zoom, markers
    ├── storage.js   ← Shared registry via GitHub Gist
    ├── ai.js        ← Preset-based arrival descriptions
    ├── arrive.js    ← Arrive page controller
    └── explore.js   ← Explore page controller
```

## Setup (required before deploying)

Locations are shared across all visitors via a GitHub Gist — no server needed.

### 1. Create the shared Gist

1. Go to https://gist.github.com
2. Create a **public** gist:
   - Filename: `locations.json`
   - Content: `[]`
3. Copy the Gist ID from the URL:
   `https://gist.github.com/yourname/`**`abc123def456`** ← this part

### 2. Create a GitHub token

1. Go to https://github.com/settings/tokens
2. **Generate new token (classic)**
3. Check the **`gist`** scope only
4. Copy the token

### 3. Edit `js/config.js`

```js
export const GIST_ID    = 'abc123def456';      // your Gist ID
export const GIST_TOKEN = 'ghp_yourtoken...';  // your token
```

### 4. Deploy to GitHub Pages

1. Push this folder to a GitHub repo
2. Go to repo Settings → Pages → Source: Deploy from branch → `main` / `root`
3. Done — your site will be live at `https://yourname.github.io/your-repo/`

## Notes

- Coordinates are truly infinite (no cap)
- Same coordinates always produce the same biome, weather, and description
- Up to 500 locations are stored in the shared Gist
- Descriptions are generated from presets — no AI API needed
