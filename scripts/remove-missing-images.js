#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../src/content/blog');

async function processPost(postDir) {
  const indexPath = path.join(postDir, 'index.md');

  try {
    let content = await fs.readFile(indexPath, 'utf-8');
    const imageRegex = /!\[([^\]]*)\]\((\.\/[^)]+)\)/g;
    let modified = false;

    // Find all image references
    const replacements = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const imagePath = match[2].substring(2); // Remove ./
      const fullImagePath = path.join(postDir, imagePath);

      // Check if image exists
      try {
        await fs.access(fullImagePath);
      } catch (error) {
        // Image doesn't exist, mark for removal
        replacements.push(match[0]);
        modified = true;
      }
    }

    // Remove missing image references
    if (modified) {
      for (const imageRef of replacements) {
        content = content.replace(imageRef + '\n\n', ''); // Remove with extra newlines
        content = content.replace(imageRef + '\n', '');   // Remove with one newline
        content = content.replace(imageRef, '');          // Remove without newline
      }

      await fs.writeFile(indexPath, content, 'utf-8');
      return { modified: true, removed: replacements.length };
    }

    return { modified: false, removed: 0 };
  } catch (error) {
    console.error(`Error processing ${postDir}:`, error.message);
    return { modified: false, removed: 0, error: error.message };
  }
}

async function main() {
  console.log('🧹 Removing missing image references...\n');

  const posts = await fs.readdir(BLOG_DIR);
  const results = [];

  for (const post of posts) {
    const postDir = path.join(BLOG_DIR, post);
    const stat = await fs.stat(postDir);

    if (stat.isDirectory()) {
      const result = await processPost(postDir);
      if (result.modified) {
        console.log(`✅ ${post}: removed ${result.removed} missing image(s)`);
        results.push({ post, ...result });
      }
    }
  }

  console.log(`\n📊 Summary: Modified ${results.length} post(s), removed ${results.reduce((sum, r) => sum + r.removed, 0)} image reference(s)`);
}

main();
