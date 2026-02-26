/**
 * Notion → posts/ sync script
 *
 * Usage: node scripts/sync-notion.mjs
 * Env:   NOTION_TOKEN, NOTION_DATABASE_ID
 */

import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import slugify from "slugify";
import matter from "gray-matter";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "posts");
const IMAGES_DIR = path.join(ROOT, "public", "images");

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error("Error: NOTION_TOKEN and NOTION_DATABASE_ID must be set");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** Download a file from url into destPath, skipping if already exists */
async function downloadFile(url, destPath) {
  if (fs.existsSync(destPath)) return;
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith("https") ? https : http;
    protocol
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlinkSync(destPath);
          downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

/** Extract plain text from Notion rich_text array */
function richTextToString(richText) {
  if (!richText || !Array.isArray(richText)) return "";
  return richText.map((t) => t.plain_text ?? "").join("");
}

/** Parse Notion page properties into frontmatter object */
function parseProperties(page) {
  const props = page.properties;

  const get = (key) => props[key];

  const title = richTextToString(get("title")?.title ?? get("제목")?.title ?? get("Name")?.title ?? []);

  const category =
    get("카테고리")?.select?.name ??
    (get("카테고리")?.multi_select ?? []).map((s) => s.name).join(", ") ??
    undefined;

  const status = get("상태")?.status?.name ?? get("상태")?.select?.name ?? undefined;
  const type = get("타입")?.select?.name ?? undefined;
  // updatedAt can be a date or created_time property
  const updatedAt =
    get("updatedAt")?.date?.start ??
    get("updatedAt")?.created_time ??
    undefined;
  const featured = get("블로깅하면 좋아요")?.checkbox ?? false;

  return {
    notion_id: page.id,
    notion_last_edited: page.last_edited_time,
    title,
    date: page.created_time.slice(0, 10),
    ...(updatedAt ? { updated_at: updatedAt } : {}),
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    featured,
  };
}

/** Replace Notion image URLs in markdown with local /images/<notionId>/<filename> paths */
async function processImages(markdownBody, notionId) {
  const imgDir = path.join(IMAGES_DIR, notionId);
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  const replacements = [];
  let match;

  while ((match = imageRegex.exec(markdownBody)) !== null) {
    const [full, alt, url] = match;
    try {
      const urlObj = new URL(url);
      const basename = path.basename(urlObj.pathname).split("?")[0] || "image.png";
      const localPath = path.join(imgDir, basename);
      const publicPath = `/images/${notionId}/${basename}`;
      replacements.push({ full, alt, url, localPath, publicPath });
    } catch {
      // skip invalid URLs
    }
  }

  for (const { localPath, url } of replacements) {
    try {
      await downloadFile(url, localPath);
    } catch (err) {
      console.warn(`  Warning: failed to download image ${url}: ${err.message}`);
    }
  }

  let result = markdownBody;
  for (const { full, alt, publicPath } of replacements) {
    result = result.replace(full, `![${alt}](${publicPath})`);
  }
  return result;
}

/** Build slug from title (handles Korean) */
function titleToSlug(title) {
  // Try slugify first (works for ASCII titles)
  const ascii = slugify(title, { lower: true, strict: true });
  if (ascii) return ascii;
  // Fallback: keep Korean/alphanumeric, replace spaces with hyphens
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\uAC00-\uD7A3\uFF00-\uFFEF가-힣-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Query all pages from the Notion DB matching filter */
async function queryDatabase() {
  const pages = [];
  let cursor;

  do {
    const res = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      filter: {
        and: [
          { property: "타입", select: { equals: "블로그" } },
          { property: "상태", status: { equals: "완료" } },
        ],
      },
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return pages;
}

async function main() {
  console.log("Starting Notion sync...");
  fs.mkdirSync(POSTS_DIR, { recursive: true });

  const pages = await queryDatabase();
  console.log(`Found ${pages.length} pages in Notion`);

  const notionIds = new Set(pages.map((p) => p.id));
  const stats = { created: 0, updated: 0, deleted: 0, skipped: 0 };

  for (const page of pages) {
    const fm = parseProperties(page);
    if (!fm.title) {
      console.warn(`  Skipping page ${page.id}: no title`);
      continue;
    }

    const slug = titleToSlug(fm.title);
    const filePath = path.join(POSTS_DIR, `${slug}.md`);

    // Check if unchanged
    if (fs.existsSync(filePath)) {
      const existing = matter(fs.readFileSync(filePath, "utf-8"));
      if (existing.data.notion_last_edited === fm.notion_last_edited) {
        console.log(`  Skipped: ${slug}.md (unchanged)`);
        stats.skipped++;
        await delay(350);
        continue;
      }
    }

    const isNew = !fs.existsSync(filePath);
    console.log(`  ${isNew ? "Creating" : "Updating"}: ${slug}.md`);

    // Convert page to markdown
    const mdBlocks = await n2m.pageToMarkdown(page.id);
    let markdownBody = n2m.toMarkdownString(mdBlocks).parent;

    // Process images
    markdownBody = await processImages(markdownBody, page.id);

    // Write file
    const fileContent = matter.stringify(markdownBody, fm);
    fs.writeFileSync(filePath, fileContent, "utf-8");

    if (isNew) stats.created++;
    else stats.updated++;

    await delay(350);
  }

  // Delete files whose notion_id is no longer in the query results
  const existingFiles = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  for (const file of existingFiles) {
    const filePath = path.join(POSTS_DIR, file);
    const { data } = matter(fs.readFileSync(filePath, "utf-8"));
    if (data.notion_id && !notionIds.has(data.notion_id)) {
      console.log(`  Deleting: ${file} (removed from Notion)`);
      fs.unlinkSync(filePath);
      stats.deleted++;
    }
  }

  console.log("\nSync complete:");
  console.log(`  Created:  ${stats.created}`);
  console.log(`  Updated:  ${stats.updated}`);
  console.log(`  Deleted:  ${stats.deleted}`);
  console.log(`  Skipped:  ${stats.skipped}`);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
