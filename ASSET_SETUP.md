# Local Asset Setup - Quick Start Guide

## What This Does

This solution allows you to migrate your football game from external CDN assets to locally-hosted assets. This protects your game from potential CDN downtime and provides better performance.

---

## ✅ One-Time Setup (5 minutes)

### Step 1: Download Assets from CDN

```bash
npm run download-assets
```

**What happens:**
- Creates `/public/assets/local/` directory with organized folders
- Downloads 50+ game assets (images, animations, sounds, fonts)
- Takes ~30-60 seconds depending on internet speed
- Creates `asset-mapping.json` for reference

### Step 2: Switch to Local Assets

```bash
npm run switch-assets -- local
```

**What happens:**
- Updates `/public/assets/asset-pack.json`
- All asset URLs now point to `./assets/local/*` instead of CDN
- Your game will load assets locally

### Step 3: Verify Everything Works

```bash
npm run verify-assets
```

**What happens:**
- Lists all downloaded assets and their sizes
- Shows if any assets are missing
- Verifies directory structure

### Step 4: Test Your Game

```bash
npm run dev
```

Open http://localhost:5173 and check that:
- ✅ Game loads completely
- ✅ All images display correctly
- ✅ Animations play smoothly
- ✅ Sound effects and music work
- ✅ UI elements look right

---

## 📋 Available Commands

```bash
npm run download-assets    # Download all assets from CDN (one-time)
npm run verify-assets      # Check that all assets are downloaded
npm run switch-assets -- local   # Use local assets
npm run switch-assets -- cdn     # Switch back to CDN assets
npm run switch-assets -- status  # Show current asset mode
npm run dev                # Run game with local development server
npm run build              # Build for production
```

---

## 📊 What Gets Downloaded

**Total: ~50 assets across categories**

| Category | Count | Type |
|----------|-------|------|
| UI Images | 7 | PNG |
| Backgrounds | 2 | PNG |
| Game Objects | 3 | PNG |
| Player Animations | 20 | PNG |
| Victory Poses | 5 | PNG |
| Sound Effects | 9 | MP3 |
| Background Music | 2 | WAV |
| Fonts | 1 | WOFF2 |

**Total Size:** ~2-5 MB (varies if already cached)

---

## 🗂️ Folder Structure After Download

```
public/assets/local/
├── images/               # UI, backgrounds, game objects, poses
├── animations/           # Player animation frames organized by action
│   ├── messi_idle_R/
│   ├── messi_walk_R/
│   ├── messi_jump_R/
│   ├── messi_slide_R/
│   ├── messi_kick_no_ball_R/
│   ├── ronaldo_idle_R/
│   ├── ronaldo_walk_R/
│   ├── ronaldo_jump_R/
│   ├── ronaldo_slide_R/
│   └── ronaldo_kick_no_ball_R/
├── audio/
│   ├── music/            # Background music
│   └── sound_effects/    # Game sound effects
└── fonts/                # Custom fonts
```

---

## ⚡ Performance Benefits

**Before (CDN Assets):**
- Requires internet connection
- Depends on CDN availability
- Network latency on each asset load
- Slower in poor network conditions

**After (Local Assets):**
- Works offline ✅
- No CDN dependency ✅
- Instant asset loading ✅
- Better development experience ✅

---

## 🔄 Switching Back to CDN

If you need to revert to CDN assets:

```bash
npm run switch-assets -- cdn
npm run dev
```

This restores the original CDN URLs while keeping local assets cached.

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| Assets show as CDN URLs | Run `npm run switch-assets -- local` |
| Some assets didn't download | Run `npm run download-assets` again (safe) |
| Game loads but no assets | Check browser console for 404 errors |
| Missing animation frames | Run `npm run verify-assets` then re-download |

---

## 📖 Detailed Documentation

For complete details, see [ASSET_MIGRATION.md](./ASSET_MIGRATION.md)

---

## 🚀 Production Deployment

When deploying:

1. ✅ Verify assets with: `npm run verify-assets`
2. ✅ Build with: `npm run build`
3. ✅ Deploy `/public/assets/local/` with your build output
4. ✅ Test all assets load in production

Vite automatically serves static files from the `public/` directory.

---

## 📝 Notes

- All downloaded assets are stored in `public/assets/local/`
- `asset-pack.json` is your main asset configuration (get updated)
- `asset-pack-local.json` is the template for local asset paths
- `asset-mapping.json` shows CDN→local path mappings
- Safe to run `npm run download-assets` multiple times

---

## ✨ Summary

1. **Download:** `npm run download-assets`
2. **Switch:** `npm run switch-assets -- local`
3. **Verify:** `npm run verify-assets`
4. **Test:** `npm run dev`
5. **Deploy:** `npm run build` + deploy `/public/`

That's it! Your game now uses local assets. 🎮

---

**Ready?** Start with: `npm run download-assets`
