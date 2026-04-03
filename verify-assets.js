#!/usr/bin/env node

/**
 * Asset Verification Script
 * Verifies that all required assets have been downloaded successfully
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, './public/assets/asset-pack-local.json');
const assetConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
const assetDirs = {
  images: path.join(__dirname, './public/assets/local/images'),
  audio: path.join(__dirname, './public/assets/local/audio'),
  fonts: path.join(__dirname, './public/assets/local/fonts'),
  animations: path.join(__dirname, './public/assets/local/animations')
};

let totalRequired = 0;
let totalFound = 0;
let missingAssets = [];

console.log('🔍 Asset Verification Report\n');
console.log('=' .repeat(60));

function extractFilename(urlPath) {
  const parts = urlPath.split('/');
  
  if (urlPath.includes('animations')) {
    const animIdx = parts.indexOf('animations');
    return parts.slice(animIdx).join('/');
  } else if (urlPath.includes('music')) {
    return 'audio/music/' + parts[parts.length - 1];
  } else if (urlPath.includes('sound_effects')) {
    return 'audio/sound_effects/' + parts[parts.length - 1];
  } else if (urlPath.includes('images')) {
    return 'images/' + parts[parts.length - 1];
  } else if (urlPath.includes('shared')) {
    return 'fonts/' + parts[parts.length - 1];
  }
  
  return parts[parts.length - 1];
}

function checkAsset(category, asset) {
  const { url, key, type } = asset;
  if (!url.includes('./assets/local')) {
    return; // Skip non-local URLs
  }
  
  totalRequired++;
  
  const filename = url.replace('./assets/local/', '');
  const fullPath = path.join('./public/assets/local', filename);
  
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`✓ ${key.padEnd(30)} ${sizeKB.padStart(8)} KB`);
    totalFound++;
  } else {
    const errorMsg = `✗ ${key.padEnd(30)} [MISSING]`;
    console.log(errorMsg);
    missingAssets.push({
      category,
      key,
      path: fullPath
    });
  }
}

// Check all categories
for (const [category, categoryData] of Object.entries(assetConfig)) {
  if (categoryData.files && Array.isArray(categoryData.files)) {
    if (category !== 'meta') {
      console.log(`\n📦 ${category}:`);
      for (const asset of categoryData.files) {
        checkAsset(category, asset);
      }
    }
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 Summary:`);
console.log(`   Total Required: ${totalRequired}`);
console.log(`   Total Found:    ${totalFound}`);
console.log(`   Missing:        ${missingAssets.length}`);

if (missingAssets.length === 0) {
  console.log(`\n✅ All assets verified successfully!`);
} else {
  console.log(`\n⚠️  Missing Assets:`);
  missingAssets.forEach(asset => {
    console.log(`   - ${asset.key} (${asset.category})`);
  });
  console.log(`\n💡 Tip: Run 'npm run download-assets' to download missing files`);
}

// Check directory structure
console.log(`\n📁 Directory Structure:`);
const dirs = [
  './public/assets/local/images',
  './public/assets/local/animations',
  './public/assets/local/audio/music',
  './public/assets/local/audio/sound_effects',
  './public/assets/local/fonts'
];

dirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  const status = exists ? '✓' : '✗';
  console.log(`   ${status} ${dir}`);
});

console.log('\n');
process.exit(missingAssets.length > 0 ? 1 : 0);
