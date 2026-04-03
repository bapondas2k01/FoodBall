# Asset Migration Guide

## Overview

This guide helps you migrate your game from CDN assets (`https://cdn-game-mcp.gambo.ai`) to locally-hosted assets. This protects your game from potential CDN downtime and provides better performance for local development.

---

## Quick Start

### Step 1: Download Assets

Download all external assets to your local machine:

```bash
npm run download-assets
```

This command will:
- Create `/public/assets/local/` directory structure
- Download all images, audio, and fonts from the CDN
- Organize assets by type (images, audio, animations, fonts)
- Generate an `asset-mapping.json` file for reference

**Expected output:**
```
📦 fonts:
✓ Downloaded: retro-pixel-arcade.otf.woff2
📦 ui_images:
✓ Downloaded: game_title.png
✓ Downloaded: play_button.png
... (and more)
✨ Download Summary:
   Downloaded: 50
   Skipped: 0
   Errors: 0
```

### Step 2: Switch to Local Assets

Replace all CDN URLs in `asset-pack.json` with local paths:

```bash
npm run switch-assets -- local
```

This updates `asset-pack.json` to use `./assets/local/*` paths instead of CDN URLs.

### Step 3: Test Your Game

Run your game to ensure it works with local assets:

```bash
npm run dev
```

Open your browser and verify:
- ✅ All images load correctly
- ✅ Animations play smoothly
- ✅ Sound effects and music work
- ✅ UI elements display properly

---

## Asset Organization

After downloading, your assets are organized as follows:

```
public/
├── assets/
│   ├── local/
│   │   ├── images/
│   │   │   ├── game_title.png
│   │   │   ├── play_button.png
│   │   │   ├── clean_soccer_field_background.png
│   │   │   ├── soccer_ball.png
│   │   │   ├── fixed_goal_left.png
│   │   │   ├── fixed_goal_right.png
│   │   │   ├── victory_banner.png
│   │   │   ├── stun_stars.png
│   │   │   ├── player1_victory_pose.png
│   │   │   ├── player2_victory_pose.png
│   │   │   └── (more UI/game objects)
│   │   ├── animations/
│   │   │   ├── messi_idle_R/
│   │   │   │   ├── frame_1.png
│   │   │   │   └── frame_2.png
│   │   │   ├── messi_walk_R/
│   │   │   ├── messi_jump_R/
│   │   │   ├── messi_slide_R/
│   │   │   ├── messi_kick_no_ball_R/
│   │   │   ├── ronaldo_idle_R/
│   │   │   ├── ronaldo_walk_R/
│   │   │   ├── ronaldo_jump_R/
│   │   │   ├── ronaldo_slide_R/
│   │   │   └── ronaldo_kick_no_ball_R/
│   │   ├── audio/
│   │   │   ├── music/
│   │   │   │   ├── soccer_theme.wav
│   │   │   │   └── soccer_match_theme.wav
│   │   │   └── sound_effects/
│   │   │       ├── button_click.mp3
│   │   │       ├── game_start.mp3
│   │   │       ├── ball_kick.mp3
│   │   │       ├── ball_bounce.mp3
│   │   │       ├── goal_cheer.mp3
│   │   │       ├── whistle.mp3
│   │   │       ├── slide_tackle.mp3
│   │   │       ├── goal_post_hit.mp3
│   │   │       └── victory_fanfare.mp3
│   │   └── fonts/
│   │       └── retro-pixel-arcade.otf.woff2
│   ├── asset-pack.json (updated with local paths)
│   └── asset-pack-local.json (local version template)
```

---

## Available Commands

### Download Assets

```bash
npm run download-assets
```

Downloads all assets from the CDN and stores them locally. Safe to run multiple times (skips existing files).

### Switch Assets

```bash
npm run switch-assets -- local
```
Switch `asset-pack.json` to use local assets.

```bash
npm run switch-assets -- cdn
```
Switch `asset-pack.json` back to CDN assets.

```bash
npm run switch-assets -- status
```
Show current asset mode (local or CDN).

---

## Files Modified

| File | Changes |
|------|---------|
| `package.json` | Added `download-assets` and `switch-assets` scripts |
| `public/assets/asset-pack.json` | Updated URLs from CDN to local paths |
| `public/assets/asset-pack-local.json` | New: Local asset configuration template |
| `download-assets.js` | New: Downloads assets from CDN |
| `switch-assets.js` | New: Switches between CDN and local assets |

---

## Troubleshooting

### Assets Still Show as CDN URLs

**Solution:** Run `npm run switch-assets -- local` to update the asset configuration.

### Some Assets Failed to Download

This is usually temporary. The script will show which assets failed:
```bash
npm run download-assets
```

Check console output for error messages and retry. Some CDN URLs may occasionally be unavailable.

### Game Loads But No Assets Appear

1. Verify local assets exist: `ls public/assets/local/`
2. Check browser console for 404 errors
3. Ensure you're using the correct asset mode: `npm run switch-assets -- status`

### Animations or Sounds Not Working

Make sure all files in the animation subdirectories were downloaded:
```bash
ls public/assets/local/animations/messi_idle_R/
```

If any frames are missing, re-run the download:
```bash
npm run download-assets
```

---

## Reverting to CDN

To revert to CDN assets at any time:

```bash
npm run switch-assets -- cdn
npm run dev
```

The original CDN URLs are restored in `asset-pack.json`.

---

## Asset Mapping Reference

An `asset-mapping.json` file is created after downloading assets. This file maps each asset key to its local path and original CDN URL:

```json
{
  "game_title": {
    "localPath": "./assets/local/images/game_title.png",
    "originalUrl": "https://cdn-game-mcp.gambo.ai/742b09f8-98a7-4783-942d-eb93423d68f4/images/game_title.png",
    "type": "image"
  },
  ...
}
```

---

## Performance Notes

**Local Assets Benefits:**
- ⚡ Faster load times (no network latency)
- 🔒 No dependency on external CDN
- 📦 Offline development capability
- 🚀 Better build optimization

**Asset Size:**
- Total assets: ~50 images/animations
- Audio files: ~10 MP3/WAV files
- Fonts: 1 custom font
- Total size: ~2-5 MB (depending on compression)

---

## Production Deployment

When deploying to production with local assets:

1. Ensure `public/assets/local/` is included in your build
2. Verify asset paths work with your build tool (Vite)
3. Test all assets load correctly in production

The `vite.config.js` should automatically serve static assets from `public/`.

---

## Support

For issues or questions:
1. Check browser console for error messages
2. Run `npm run switch-assets -- status` to verify current mode
3. Try re-downloading assets: `npm run download-assets`
4. Check that all directories exist under `public/assets/local/`

---

**Last Updated:** April 3, 2026
