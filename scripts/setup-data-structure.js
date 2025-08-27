#!/usr/bin/env node

/**
 * Setup script for organizing scraped data files
 * Run with: node scripts/setup-data-structure.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stores = ['auchan', 'carrefour', 'kaufland', 'mega', 'freshful', 'lidl'];
const dataDir = path.join(__dirname, '..', 'public', 'data', 'dev');

console.log('🔧 Setting up data directory structure...');

// Create store directories
stores.forEach(store => {
  const storeDir = path.join(dataDir, store);
  
  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
    console.log(`📁 Created directory: ${store}/`);
  } else {
    console.log(`✅ Directory exists: ${store}/`);
  }
});

// Create a data organization guide
const organizationGuide = `# Data Organization Guide

## Directory Structure

\`\`\`
public/data/dev/
├── auchan/
├── carrefour/
├── kaufland/
├── mega/
├── freshful/
└── lidl/
\`\`\`

## File Organization

### Option 1: Multiple files per store (Recommended)
Place your scraped JSON files in the respective store directories:

\`\`\`
public/data/dev/lidl/
├── alimente-si-bauturi-filtered-100pct-2025-08-27T14-38-58-867Z.json
├── bebelusi-copii-si-jucarii-2025-08-27T14-42-17-981Z.json
├── accesorii-itc-gama-variata-2025-08-27T10-40-36-220Z.json
└── articole-si-produse-pentru-bebelusi-2025-08-26T18-55-45-610Z.json
\`\`\`

### Option 2: Single file per store (Backwards compatibility)
\`\`\`
public/data/dev/
├── auchan.json
├── carrefour.json
├── kaufland.json
├── mega.json
├── freshful.json
└── lidl.json
\`\`\`

## Category Mapping

The system automatically extracts categories from filenames:

- \`alimente-si-bauturi-*\` → "Băcănie"
- \`bebelusi-copii-*\` → "Copii & Bebeluși"  
- \`accesorii-itc-*\` → "Electronice & IT"
- \`articole-si-produse-pentru-bebelusi-*\` → "Copii & Bebeluși"

## Usage

1. Drop your scraped JSON files into the appropriate store directories
2. The system will auto-discover and load all files
3. Categories will be automatically extracted from filenames
4. Products will be normalized and merged across all files

## File Discovery

The data loader will:
1. First try to load single files (auchan.json, etc.)
2. If no single file found, scan store directories for JSON files
3. Load and merge all discovered files
4. Extract category information from filenames
`;

fs.writeFileSync(path.join(dataDir, 'README.md'), organizationGuide);
console.log('📝 Created data organization guide: public/data/dev/README.md');

console.log('\n✅ Data structure setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Place your scraped JSON files in the store directories');
console.log('2. Files will be auto-discovered and loaded');
console.log('3. Categories will be extracted from filenames');
console.log('4. Run npm run dev to test with your real data');
