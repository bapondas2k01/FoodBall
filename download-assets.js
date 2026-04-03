#!/usr/bin/env node

/**
 * Asset Downloader Script
 * Downloads all game assets from CDN to local directories
 * Maintains organized folder structure by asset type
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetConfigPath = path.join(__dirname, './public/assets/asset-pack.json');
const assetConfig = JSON.parse(readFileSync(assetConfigPath, 'utf-8'));

// Define local asset directories
const assetDirs = {
  images: './public/assets/local/images',
  audio: './public/assets/local/audio',
  fonts: './public/assets/local/fonts',
  animations: './public/assets/local/animations'
};

// Mapping of asset keys to local filenames and subdirectories
const assetMapping = {};

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dirPath}`);
  }
}

/**
 * Download file from URL
 */
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const fileName = path.basename(filePath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filePath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${fileName}`);
          resolve(filePath);
        });
        file.on('error', reject);
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

/**
 * Extract filename from URL or generate from key
 */
function getLocalFilename(url, key) {
  // Extract filename from path
  const urlPath = new URL(url).pathname;
  const parts = urlPath.split('/');
  
  // Handle different URL structures
  if (parts.includes('animations')) {
    // animations/messi_idle_R/frame_1.png -> messi_idle_R/frame_1.png (without animations prefix)
    const animIdx = parts.indexOf('animations');
    const animPath = parts.slice(animIdx + 1).join('/');
    return animPath;
  } else if (parts.includes('music')) {
    // music/soccer_theme.wav -> soccer_theme.wav
    return parts[parts.length - 1];
  } else if (parts.includes('sound_effects')) {
    // sound_effects/button_click.mp3 -> button_click.mp3
    return parts[parts.length - 1];
  } else if (parts.includes('images')) {
    // images/game_title.png -> game_title.png
    return parts[parts.length - 1];
  } else if (parts.includes('shared')) {
    // shared/retro-pixel-arcade.otf.woff2
    return parts[parts.length - 1];
  }
  
  return parts[parts.length - 1];
}

/**
 * Determine asset subdirectory and filename
 */
function getAssetPath(url, key, type) {
  const filename = getLocalFilename(url, key);
  let subdir = assetDirs.images;
  
  if (type === 'audio') {
    const urlPath = new URL(url).pathname;
    if (urlPath.includes('music')) {
      subdir = path.join(assetDirs.audio, 'music');
    } else if (urlPath.includes('sound_effects')) {
      subdir = path.join(assetDirs.audio, 'sound_effects');
    }
  } else if (type === 'font') {
    subdir = assetDirs.fonts;
  } else if (url.includes('animations')) {
    // filename is already "messi_idle_R/frame_1.png", not including animations prefix
    subdir = assetDirs.animations;
  }
  
  return {
    dir: subdir,
    filename: filename,
    relativePath: path.relative('./public', path.join(subdir, filename)).replace(/\\/g, '/')
  };
}

/**
 * Main download function
 */
async function downloadAllAssets() {
  console.log('🎮 Starting asset download...\n');
  
  // Create all directories
  Object.values(assetDirs).forEach(dir => ensureDir(dir));
  ensureDir(path.join(assetDirs.audio, 'music'));
  ensureDir(path.join(assetDirs.audio, 'sound_effects'));
  ensureDir(path.join(assetDirs.animations, 'messi_idle_R'));
  ensureDir(path.join(assetDirs.animations, 'messi_walk_R'));
  ensureDir(path.join(assetDirs.animations, 'messi_jump_R'));
  ensureDir(path.join(assetDirs.animations, 'messi_slide_R'));
  ensureDir(path.join(assetDirs.animations, 'messi_kick_no_ball_R'));
  ensureDir(path.join(assetDirs.animations, 'ronaldo_idle_R'));
  ensureDir(path.join(assetDirs.animations, 'ronaldo_walk_R'));
  ensureDir(path.join(assetDirs.animations, 'ronaldo_jump_R'));
  ensureDir(path.join(assetDirs.animations, 'ronaldo_slide_R'));
  ensureDir(path.join(assetDirs.animations, 'ronaldo_kick_no_ball_R'));
  
  console.log('');
  
  let downloadedCount = 0;
  let skippedCount = 0;
  const errors = [];
  
  // Iterate through all asset categories
  for (const [category, categoryData] of Object.entries(assetConfig)) {
    if (categoryData.files && Array.isArray(categoryData.files)) {
      console.log(`\n📦 ${category}:`);
      
      for (const asset of categoryData.files) {
        const { key, url, type } = asset;
        
        if (!url) {
          console.log(`⊘ Skipped: ${key} (no URL)`);
          skippedCount++;
          continue;
        }
        
        try {
          const assetPath = getAssetPath(url, key, type);
          const fullPath = path.join(assetPath.dir, assetPath.filename);
          
          // Create subdirectory for animations if needed
          const assetDirectory = path.dirname(fullPath);
          ensureDir(assetDirectory);
          
          // Check if already exists
          if (fs.existsSync(fullPath)) {
            console.log(`⊘ Skipped: ${assetPath.filename} (already exists)`);
            skippedCount++;
          } else {
            await downloadFile(url, fullPath);
            downloadedCount++;
          }
          
          // Store mapping for later use
          assetMapping[key] = {
            localPath: `./assets/${assetPath.relativePath}`,
            originalUrl: url,
            type: type
          };
        } catch (error) {
          const errorMsg = `✗ Failed to download ${key}: ${error.message}`;
          console.log(errorMsg);
          errors.push(errorMsg);
        }
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n✨ Download Summary:`);
  console.log(`   Downloaded: ${downloadedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Errors: ${errors.length}\n`);
  
  if (errors.length > 0) {
    console.log(`⚠️  Errors encountered:\n`);
    errors.forEach(err => console.log(`   ${err}`));
  }
  
  // Save mapping to JSON file for reference
  const mappingPath = './public/assets/asset-mapping.json';
  fs.writeFileSync(mappingPath, JSON.stringify(assetMapping, null, 2));
  console.log(`✓ Asset mapping saved to: ${mappingPath}`);
  
  console.log('\n✅ Asset download complete!\n');
}

// Run the downloader
downloadAllAssets().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
