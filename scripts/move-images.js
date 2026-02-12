#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const MAPPING_FILE = path.join(__dirname, '../image-mapping.json');

async function moveImages() {
  console.log('📦 Moving images to correct blog post directories...\n');

  // Read the mapping
  const mappingData = await fs.readFile(MAPPING_FILE, 'utf-8');
  const mapping = JSON.parse(mappingData);

  let movedCount = 0;
  let notFoundCount = 0;

  for (const entry of mapping.mappings) {
    const postDir = path.join(BLOG_DIR, entry.post);

    for (const imageName of entry.images) {
      // The downloaded files have asterisks replaced with dashes
      const downloadedName = imageName.replace(/\*/g, '-');
      const sourcePath = path.join(BLOG_DIR, downloadedName);
      const destPath = path.join(postDir, imageName);

      try {
        // Check if source file exists
        await fs.access(sourcePath);

        // Ensure destination directory exists
        await fs.mkdir(postDir, { recursive: true });

        // Move the file
        await fs.rename(sourcePath, destPath);
        console.log(`✅ Moved ${downloadedName} → ${entry.post}/`);
        movedCount++;
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`⚠️  Not found: ${downloadedName}`);
          notFoundCount++;
        } else {
          console.error(`❌ Error moving ${downloadedName}:`, error.message);
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Summary: Moved ${movedCount} images, ${notFoundCount} not found`);
  console.log('='.repeat(60));
}

moveImages().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
