#!/usr/bin/env node

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MARKDOWN_DIR = path.join(__dirname, '../markdown');
const BLOG_DIR = path.join(__dirname, '../src/content/blog');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const singleFileArg = args.indexOf('--single');
const singleFile = singleFileArg !== -1 ? args[singleFileArg + 1] : null;

/**
 * Extract metadata from Medium export filename and content
 */
function extractMetadata(filename, content) {
  const lines = content.split('\n');

  // Extract title from first line (remove '# ')
  const title = lines[0].replace(/^#\s+/, '').trim();

  // Extract date from filename (YYYY-MM-DD)
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})_/);
  if (!dateMatch) {
    throw new Error(`Could not extract date from filename: ${filename}`);
  }
  const date = dateMatch[1];

  // Generate slug: date + title slug (remove unique ID after --)
  const titlePart = filename
    .replace(/^\d{4}-\d{2}-\d{2}_/, '') // Remove date prefix
    .replace(/--[a-f0-9]+\.md$/, '')     // Remove unique ID and extension
    .replace(/_/g, '-')                  // Replace underscores with hyphens
    .toLowerCase();
  const slug = `${date}-${titlePart}`;

  // Extract description: first paragraph after title (line 3, before ---)
  let description = '';
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && line !== '---') {
      description = line;
      break;
    }
  }

  return {
    title,
    description,
    date,
    slug
  };
}

/**
 * Transform content: remove duplicates, footer, fix image references
 */
function transformContent(content, metadata) {
  const lines = content.split('\n');

  // Find the first --- divider
  const firstDividerIndex = lines.findIndex((line, idx) => idx > 0 && line.trim() === '---');

  // Remove lines 1-9 (original title, description, divider, duplicate H3, duplicate description)
  // Keep content starting after the duplicate intro
  let contentStart = 0;
  if (firstDividerIndex !== -1) {
    // Skip past the divider and the duplicate H3/paragraph
    // Look for the first substantive content after the divider
    for (let i = firstDividerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      // Skip the duplicate H3 (### title) and duplicate first paragraph
      if (line && !line.startsWith('###')) {
        // Check if this matches the description (duplicate paragraph)
        if (line === metadata.description) {
          continue;
        }
        contentStart = i;
        break;
      }
    }
  }

  // Find footer start (lines starting with "By [Dave Anderson]")
  let footerStart = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('By [Dave Anderson]')) {
      footerStart = i;
      break;
    }
  }

  // Keep only the main content
  let transformedLines = lines.slice(contentStart, footerStart);

  // Extract image URLs for later downloading
  const imageUrls = [];
  transformedLines = transformedLines.map(line => {
    // Match Medium CDN image URLs
    const imageRegex = /!\[([^\]]*)\]\((https:\/\/cdn-images-1\.medium\.com\/[^)]+)\)/g;
    return line.replace(imageRegex, (_match, alt, url) => {
      // Extract filename from URL (the hash part)
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      imageUrls.push({ url, filename, alt });
      // Replace with local reference (same directory as index.md)
      return `![${alt}](./${filename})`;
    });
  });

  return {
    content: transformedLines.join('\n').trim(),
    imageUrls
  };
}

/**
 * Generate frontmatter
 */
function generateFrontmatter(metadata) {
  return `---
title: "${metadata.title.replace(/"/g, '\\"')}"
description: "${metadata.description.replace(/"/g, '\\"')}"
publicationDate: ${metadata.date}T00:00:00Z
---`;
}

/**
 * Download image with retry logic and redirect support
 */
async function downloadImage(url, destPath, retries = 3, redirectCount = 0) {
  const MAX_REDIRECTS = 5;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fs.mkdir(path.dirname(destPath), { recursive: true });

      return await new Promise((resolve, reject) => {
        const file = fsSync.createWriteStream(destPath);
        const isHttps = url.startsWith('https://');
        const httpModule = isHttps ? https : http;

        httpModule.get(url, (response) => {
          // Handle redirects
          if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
            file.close();
            try {
              fsSync.unlinkSync(destPath);
            } catch (e) {
              // Ignore
            }

            if (redirectCount >= MAX_REDIRECTS) {
              reject(new Error(`Too many redirects (${redirectCount}): ${url}`));
              return;
            }

            let redirectUrl = response.headers.location;
            if (!redirectUrl) {
              reject(new Error(`Redirect without location header: ${url}`));
              return;
            }

            // Handle relative URLs
            if (redirectUrl.startsWith('/')) {
              const urlObj = new URL(url);
              redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
            } else if (!redirectUrl.startsWith('http')) {
              // Relative to current path
              const urlObj = new URL(url);
              const basePath = urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1);
              redirectUrl = `${urlObj.protocol}//${urlObj.host}${basePath}${redirectUrl}`;
            }

            // Follow redirect
            downloadImage(redirectUrl, destPath, retries, redirectCount + 1)
              .then(resolve)
              .catch(reject);
            return;
          }

          if (response.statusCode === 404) {
            file.close();
            try {
              fsSync.unlinkSync(destPath);
            } catch (e) {
              // Ignore
            }
            reject(new Error(`Image not found (404): ${url}`));
            return;
          }

          if (response.statusCode !== 200) {
            file.close();
            try {
              fsSync.unlinkSync(destPath);
            } catch (e) {
              // Ignore
            }
            reject(new Error(`HTTP ${response.statusCode}: ${url}`));
            return;
          }

          response.pipe(file);

          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', (err) => {
          try {
            file.close();
            fsSync.unlinkSync(destPath);
          } catch (e) {
            // Ignore
          }
          reject(err);
        });

        file.on('error', (err) => {
          try {
            fsSync.unlinkSync(destPath);
          } catch (e) {
            // Ignore unlink errors
          }
          reject(err);
        });
      });
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`  Retry ${attempt}/${retries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Download images sequentially with delay to avoid rate limiting
 */
async function downloadImages(imageUrls, destDir) {
  const results = [];
  const DELAY_MS = 2000; // 2 second delay between downloads

  for (let i = 0; i < imageUrls.length; i++) {
    const { url, filename } = imageUrls[i];
    const destPath = path.join(destDir, filename);

    try {
      await downloadImage(url, destPath);
      results.push({ status: 'fulfilled' });
      console.log(`    ✓ Downloaded ${filename}`);
    } catch (error) {
      results.push({ status: 'rejected', reason: error });
      console.log(`    ✗ Failed ${filename}: ${error.message}`);
    }

    // Add delay between downloads (except after the last one)
    if (i < imageUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  return results;
}

/**
 * Migrate a single Medium export file
 */
async function migratePost(filename) {
  console.log(`\n📝 Processing: ${filename}`);

  const sourcePath = path.join(MARKDOWN_DIR, filename);
  const content = await fs.readFile(sourcePath, 'utf-8');

  // Extract metadata
  const metadata = extractMetadata(filename, content);
  console.log(`  Title: ${metadata.title}`);
  console.log(`  Date: ${metadata.date}`);
  console.log(`  Slug: ${metadata.slug}`);

  // Transform content
  const { content: transformedContent, imageUrls } = transformContent(content, metadata);

  // Generate frontmatter
  const frontmatter = generateFrontmatter(metadata);

  // Combine frontmatter and content
  const finalContent = `${frontmatter}\n\n${transformedContent}\n`;

  // Create output directory
  const postDir = path.join(BLOG_DIR, metadata.slug);
  const outputPath = path.join(postDir, 'index.md');

  if (isDryRun) {
    console.log(`  [DRY RUN] Would create: ${outputPath}`);
    console.log(`  [DRY RUN] Images to download: ${imageUrls.length}`);
    imageUrls.forEach(({ url, filename }) => {
      console.log(`    - ${filename} from ${url}`);
    });
    return { success: true, slug: metadata.slug };
  }

  // Create directory and write file
  await fs.mkdir(postDir, { recursive: true });
  await fs.writeFile(outputPath, finalContent, 'utf-8');
  console.log(`  ✅ Created: ${outputPath}`);

  // Download images if any
  if (imageUrls.length > 0) {
    console.log(`  📥 Downloading ${imageUrls.length} image(s)...`);
    // Download images to same directory as index.md
    const downloadResults = await downloadImages(imageUrls, postDir);

    const failures = downloadResults.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.log(`  ⚠️  Failed to download ${failures.length} image(s):`);
      failures.forEach((result, idx) => {
        console.log(`    - ${imageUrls[idx].filename}: ${result.reason.message}`);
      });
    } else {
      console.log(`  ✅ Downloaded ${imageUrls.length} image(s)`);
    }

    return {
      success: true,
      slug: metadata.slug,
      imageCount: imageUrls.length,
      imageFailures: failures.length
    };
  }

  return {
    success: true,
    slug: metadata.slug,
    imageCount: 0,
    imageFailures: 0
  };
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Medium to Astro Migration Script\n');

  if (isDryRun) {
    console.log('ℹ️  DRY RUN MODE - No files will be created\n');
  }

  // Get list of markdown files
  let files = await fs.readdir(MARKDOWN_DIR);
  files = files.filter(f => f.endsWith('.md'));

  if (singleFile) {
    if (!files.includes(singleFile)) {
      console.error(`❌ Error: File not found: ${singleFile}`);
      process.exit(1);
    }
    files = [singleFile];
    console.log(`ℹ️  Processing single file: ${singleFile}\n`);
  } else {
    console.log(`ℹ️  Found ${files.length} files to migrate\n`);
  }

  // Migrate all files
  const results = [];
  for (const file of files) {
    try {
      const result = await migratePost(file);
      results.push(result);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
      results.push({ success: false, file, error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY\n');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  if (!isDryRun) {
    const totalImages = results.reduce((sum, r) => sum + (r.imageCount || 0), 0);
    const failedImages = results.reduce((sum, r) => sum + (r.imageFailures || 0), 0);
    console.log(`📥 Images downloaded: ${totalImages - failedImages}/${totalImages}`);
  }

  if (failed > 0) {
    console.log('\n⚠️  Failed files:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.file}: ${r.error}`);
    });
  }

  console.log('='.repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
