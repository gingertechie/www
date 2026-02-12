#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const EXPECTED_POST_COUNT = 27;

// Validation results
const results = {
  totalPosts: 0,
  validPosts: 0,
  issues: []
};

/**
 * Check if a post has valid frontmatter
 */
function validateFrontmatter(content, postDir) {
  const issues = [];

  // Check frontmatter exists
  if (!content.startsWith('---')) {
    issues.push('Missing frontmatter');
    return issues;
  }

  const frontmatterEnd = content.indexOf('---', 3);
  if (frontmatterEnd === -1) {
    issues.push('Invalid frontmatter format');
    return issues;
  }

  const frontmatter = content.substring(3, frontmatterEnd);

  // Check required fields
  if (!frontmatter.includes('title:')) {
    issues.push('Missing required field: title');
  }

  if (!frontmatter.includes('description:')) {
    issues.push('Missing required field: description');
  }

  if (!frontmatter.includes('publicationDate:')) {
    issues.push('Missing required field: publicationDate');
  }

  // Validate publicationDate format (should be ISO 8601)
  const dateMatch = frontmatter.match(/publicationDate:\s*(.+)/);
  if (dateMatch) {
    const dateStr = dateMatch[1].trim();
    if (!dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)) {
      issues.push(`Invalid publicationDate format: ${dateStr}`);
    }
  }

  return issues;
}

/**
 * Check for Medium CDN URLs in content
 */
function checkMediumUrls(content) {
  const mediumUrlRegex = /https:\/\/cdn-images-1\.medium\.com/g;
  const matches = content.match(mediumUrlRegex);
  return matches ? matches.length : 0;
}

/**
 * Check for footer sections
 */
function checkFooter(content) {
  const footerPatterns = [
    /By \[Dave Anderson\]/,
    /Canonical link/,
    /Exported from \[Medium\]/
  ];

  return footerPatterns.some(pattern => pattern.test(content));
}

/**
 * Extract image references from markdown
 */
function extractImageReferences(content) {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images = [];
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    images.push({
      alt: match[1],
      path: match[2]
    });
  }

  return images;
}

/**
 * Check if image files exist
 */
async function validateImages(postDir, images) {
  const issues = [];

  for (const image of images) {
    // Skip external URLs
    if (image.path.startsWith('http://') || image.path.startsWith('https://')) {
      continue;
    }

    // Check local images
    if (image.path.startsWith('./')) {
      const imagePath = path.join(postDir, image.path.substring(2));
      try {
        await fs.access(imagePath);
      } catch (error) {
        issues.push(`Image not found: ${image.path}`);
      }
    }
  }

  return issues;
}

/**
 * Validate a single blog post
 */
async function validatePost(postSlug) {
  const postDir = path.join(BLOG_DIR, postSlug);
  const indexPath = path.join(postDir, 'index.md');

  const postIssues = {
    slug: postSlug,
    errors: [],
    warnings: []
  };

  try {
    // Check if index.md exists
    const content = await fs.readFile(indexPath, 'utf-8');

    // Validate frontmatter
    const frontmatterIssues = validateFrontmatter(content, postDir);
    postIssues.errors.push(...frontmatterIssues);

    // Check for Medium CDN URLs
    const mediumUrlCount = checkMediumUrls(content);
    if (mediumUrlCount > 0) {
      postIssues.errors.push(`Found ${mediumUrlCount} Medium CDN URL(s) in content`);
    }

    // Check for footer sections
    if (checkFooter(content)) {
      postIssues.errors.push('Footer section still present');
    }

    // Validate images
    const images = extractImageReferences(content);
    const imageIssues = await validateImages(postDir, images);
    if (imageIssues.length > 0) {
      postIssues.warnings.push(...imageIssues);
    }

    // Count valid posts (no errors)
    if (postIssues.errors.length === 0) {
      results.validPosts++;
    }

    return postIssues;
  } catch (error) {
    postIssues.errors.push(`Failed to read post: ${error.message}`);
    return postIssues;
  }
}

/**
 * Check for duplicate slugs
 */
function checkDuplicateSlugs(posts) {
  const slugs = new Map();
  const duplicates = [];

  for (const post of posts) {
    if (slugs.has(post)) {
      duplicates.push(post);
    } else {
      slugs.set(post, true);
    }
  }

  return duplicates;
}

/**
 * Main validation function
 */
async function main() {
  console.log('🔍 Validating Medium to Astro Migration\n');

  try {
    // Get list of blog posts (exclude example posts)
    const allPosts = await fs.readdir(BLOG_DIR);
    const posts = allPosts.filter(p => p.startsWith('201') || p.startsWith('202'));

    results.totalPosts = posts.length;

    console.log(`📊 Found ${posts.length} migrated posts (expected ${EXPECTED_POST_COUNT})\n`);

    if (posts.length !== EXPECTED_POST_COUNT) {
      results.issues.push({
        type: 'error',
        message: `Post count mismatch: expected ${EXPECTED_POST_COUNT}, found ${posts.length}`
      });
    }

    // Check for duplicate slugs
    const duplicates = checkDuplicateSlugs(posts);
    if (duplicates.length > 0) {
      results.issues.push({
        type: 'error',
        message: `Found duplicate slugs: ${duplicates.join(', ')}`
      });
    }

    // Validate each post
    console.log('Validating posts...\n');
    const postValidations = [];

    for (const post of posts) {
      const validation = await validatePost(post);
      if (validation.errors.length > 0 || validation.warnings.length > 0) {
        postValidations.push(validation);
      }
    }

    // Print results
    console.log('='.repeat(60));
    console.log('📊 VALIDATION SUMMARY\n');

    console.log(`Total posts: ${results.totalPosts}`);
    console.log(`Valid posts: ${results.validPosts}`);
    console.log(`Posts with errors: ${postValidations.filter(p => p.errors.length > 0).length}`);
    console.log(`Posts with warnings: ${postValidations.filter(p => p.warnings.length > 0).length}`);

    // Print general issues
    if (results.issues.length > 0) {
      console.log('\n⚠️  General Issues:');
      results.issues.forEach(issue => {
        const icon = issue.type === 'error' ? '❌' : '⚠️ ';
        console.log(`  ${icon} ${issue.message}`);
      });
    }

    // Print post-specific issues
    if (postValidations.length > 0) {
      console.log('\n📝 Post-Specific Issues:\n');

      for (const post of postValidations) {
        if (post.errors.length > 0) {
          console.log(`❌ ${post.slug}:`);
          post.errors.forEach(error => console.log(`    - ${error}`));
        }

        if (post.warnings.length > 0) {
          console.log(`⚠️  ${post.slug}:`);
          post.warnings.forEach(warning => console.log(`    - ${warning}`));
        }

        console.log('');
      }
    }

    console.log('='.repeat(60));

    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPosts: results.totalPosts,
        validPosts: results.validPosts,
        expectedPosts: EXPECTED_POST_COUNT,
        postsWithErrors: postValidations.filter(p => p.errors.length > 0).length,
        postsWithWarnings: postValidations.filter(p => p.warnings.length > 0).length
      },
      generalIssues: results.issues,
      postIssues: postValidations
    };

    const reportPath = path.join(__dirname, '../migration-validation-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Full report saved to: ${reportPath}`);

    // Exit code: 0 if all valid, 1 if any errors
    const hasErrors = results.issues.some(i => i.type === 'error') ||
                      postValidations.some(p => p.errors.length > 0);
    process.exit(hasErrors ? 1 : 0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
