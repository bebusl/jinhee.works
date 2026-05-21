/**
 * Notion → posts/ sync script
 *
 * Usage: node scripts/sync-notion.mjs
 * Env:   NOTION_TOKEN, NOTION_DATABASE_ID
 *
 * Mock mode (API 호출 없이 로컬 테스트):
 *   node scripts/sync-notion.mjs --mock
 */

import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import slugify from "slugify";
import matter from "gray-matter";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import https from "node:https";
import http from "node:http";

const MOCK_MODE = process.argv.includes("--mock");
const isProd = process.env.NODE_ENV === "production";

console.log("IS PRODUCTION?", isProd);
if (MOCK_MODE) console.log("MOCK MODE: Notion API 호출을 건너뜁니다.");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, isProd ? "posts" : "posts/local");
const IMAGES_DIR = path.join(ROOT, "public", "images");

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!MOCK_MODE && (!NOTION_TOKEN || !NOTION_DATABASE_ID)) {
  console.error("Error: NOTION_TOKEN and NOTION_DATABASE_ID must be set");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN ?? "mock-token-for-dev" });
const n2m = new NotionToMarkdown({ notionClient: notion });

// Equation 블록 → 코드블록 (remark-math 없이 {} 가 JSX 에러 유발하므로)
n2m.setCustomTransformer("equation", async (block) => {
  return `\`\`\`math\n${block.equation.expression}\n\`\`\``;
});

// Callout 블록 → <Callout> MDX 컴포넌트 (기본 > blockquote 대신)
n2m.setCustomTransformer("callout", async (block) => {
  const callout = block.callout;
  const icon = callout.icon?.type === "emoji" ? callout.icon.emoji : "💡";
  const text = (callout.rich_text ?? [])
    .map((t) => {
      let s = t.plain_text ?? "";
      if (!s) return "";
      const leading = s.match(/^\s*/)[0];
      const trailing = s.match(/\s*$/)[0];
      let inner = s.trim();
      if (!inner) return s;
      if (t.annotations?.code) inner = `\`${inner}\``;
      if (t.annotations?.bold) inner = `**${inner}**`;
      if (t.annotations?.italic) inner = `*${inner}*`;
      if (t.annotations?.strikethrough) inner = `~~${inner}~~`;
      return leading + inner + trailing;
    })
    .join("");
  return `<Callout icon="${icon}">${text}</Callout>`;
});

// ─── Mock 설정 ────────────────────────────────────────────────────────────────

const MOCK_PAGE_ID = "mock-page-uuid-0000";

const mockPage = {
  id: MOCK_PAGE_ID,
  created_time: "2026-05-01T00:00:00.000Z",
  last_edited_time: "2026-05-14T00:00:00.000Z",
  properties: {
    title: {
      title: [
        {
          type: "text",
          text: { content: "Mock 테스트 페이지" },
          plain_text: "Mock 테스트 페이지",
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          href: null,
        },
      ],
    },
    카테고리: { select: { name: "테스트" } },
    상태: { status: { name: "완료" } },
    타입: { select: { name: "블로그" } },
    "블로깅하면 좋아요": { checkbox: false },
  },
};

function makeMockBlock(type, typeData, hasChildren = false) {
  return {
    object: "block",
    id: `mock-${type}-std-0000`,
    parent: { type: "page_id", page_id: MOCK_PAGE_ID },
    type,
    created_time: "2026-05-01T00:00:00.000Z",
    last_edited_time: "2026-05-14T00:00:00.000Z",
    created_by: { object: "user", id: "mock-user-uuid" },
    last_edited_by: { object: "user", id: "mock-user-uuid" },
    has_children: hasChildren,
    archived: false,
    in_trash: false,
    [type]: typeData,
  };
}

function mockRt(content, annotations = {}) {
  return {
    type: "text",
    text: { content, link: null },
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
      ...annotations,
    },
    plain_text: content,
    href: null,
  };
}

const standardMockBlocks = [
  makeMockBlock("heading_1", {
    rich_text: [mockRt("표준 블록 (notion-to-md 기본 처리)")],
    color: "default",
    is_toggleable: false,
  }),
  makeMockBlock("heading_2", {
    rich_text: [mockRt("텍스트 블록")],
    color: "default",
    is_toggleable: false,
  }),
  makeMockBlock("paragraph", {
    rich_text: [
      mockRt("일반 단락입니다. "),
      mockRt("굵게", { bold: true }),
      mockRt("와 "),
      mockRt("기울임", { italic: true }),
      mockRt("도 포함됩니다."),
    ],
    color: "default",
  }),
  makeMockBlock("bulleted_list_item", {
    rich_text: [mockRt("불릿 리스트 항목 1")],
    color: "default",
  }),
  makeMockBlock("bulleted_list_item", {
    rich_text: [mockRt("불릿 리스트 항목 2")],
    color: "default",
  }),
  makeMockBlock("numbered_list_item", {
    rich_text: [mockRt("번호 리스트 항목 1")],
    color: "default",
    number: 1,
  }),
  makeMockBlock("numbered_list_item", {
    rich_text: [mockRt("번호 리스트 항목 2")],
    color: "default",
    number: 2,
  }),
  makeMockBlock("quote", {
    rich_text: [mockRt("인용구 텍스트입니다.")],
    color: "default",
  }),
  makeMockBlock("code", {
    rich_text: [mockRt('console.log("Hello, Notion!");')],
    language: "javascript",
    caption: [],
  }),
  makeMockBlock("divider", {}),
  makeMockBlock("heading_2", {
    rich_text: [mockRt("커스텀 트랜스포머 필요 블록")],
    color: "default",
    is_toggleable: false,
  }),
];

async function setupMock() {
  const { ALL_NON_MD_BLOCKS } =
    await import("../../notion-integration-test/mock-blocks.mjs");
  const customBlocks = ALL_NON_MD_BLOCKS.map((b) => b.block);
  const allMockBlocks = [...standardMockBlocks, ...customBlocks];

  notion.blocks.children.list = async ({ block_id }) => {
    if (block_id === MOCK_PAGE_ID) {
      return {
        object: "list",
        results: allMockBlocks,
        has_more: false,
        next_cursor: null,
      };
    }
    // has_children: true인 블록의 자식은 빈 배열로 반환
    return { object: "list", results: [], has_more: false, next_cursor: null };
  };
}
// 이건 다 쓰고 나면 지우면 됩니당 ~!

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
          downloadFile(res.headers.location, destPath)
            .then(resolve)
            .catch(reject);
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

/** Extract plain text from Notion rich_text array.
 *  escapeHtml=true: MDX 콘텐츠 용 — &, <, > 를 HTML 엔티티로 치환 */
function richTextToString(richText, escapeHtml = false) {
  if (!richText || !Array.isArray(richText)) return "";
  return richText.map((t) => t.plain_text ?? "").join("");
}

/** Parse Notion page properties into frontmatter object */
function parseProperties(page) {
  const props = page.properties;

  const get = (key) => props[key];

  const title = richTextToString(
    get("title")?.title ?? get("제목")?.title ?? get("Name")?.title ?? [],
  );

  const category =
    get("카테고리")?.select?.name ??
    (get("카테고리")?.multi_select ?? []).map((s) => s.name).join(", ") ??
    undefined;

  const status =
    get("상태")?.status?.name ?? get("상태")?.select?.name ?? undefined;
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
      // decodeURIComponent: Notion URL pathname에 %E1%84%8B 등 percent-encoded 한글이 있는 경우
      // 그대로 파일명으로 쓰면 브라우저가 URL을 한 번 더 디코딩해 실제 파일명과 불일치 발생.
      // decode 후 저장하고, publicPath도 encodeURIComponent로 안전하게 인코딩한다.
      const rawBasename =
        decodeURIComponent(path.basename(urlObj.pathname).split("?")[0]) ||
        "image.png";
      const localPath = path.join(imgDir, rawBasename);
      const publicPath = `/images/${notionId}/${encodeURIComponent(rawBasename)}`;
      replacements.push({ full, alt, url, localPath, publicPath });
    } catch {
      // skip invalid URLs
      console.log("Invalid URLS");
    }
  }

  for (const { localPath, url } of replacements) {
    try {
      await downloadFile(url, localPath);
    } catch (err) {
      console.warn(
        `  Warning: failed to download image ${url}: ${err.message}`,
      );
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

  let pages;
  if (MOCK_MODE) {
    await setupMock();
    pages = [mockPage];
  } else {
    pages = await queryDatabase();
  }
  console.log(
    `Found ${pages.length} pages${MOCK_MODE ? " (mock)" : " in Notion"}`,
  );

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

    // Check if unchanged (mock 모드에서는 항상 덮어씀)
    if (!MOCK_MODE && fs.existsSync(filePath)) {
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

    // MDX-breaking 패턴 후처리
    // 1. HTML 주석 제거 (멀티라인 가능하므로 전체 문자열 대상)
    markdownBody = markdownBody.replace(/<!--[\s\S]*?-->/g, "");

    // 2. 줄 단위로 처리: fence depth를 정확히 추적해 코드 블록 안/밖 구분
    //    - 4-backtick 블록 안의 3-backtick 은 fence로 보지 않음
    //    - 코드 블록 밖: { } 이스케이프, < 이스케이프, import/export ESM 방어
    {
      let fenceDepth = 0;
      markdownBody = markdownBody
        .split("\n")
        .map((line) => {
          const fm = line.match(/^(\s*)(```+)(.*)/);
          if (fm) {
            const count = fm[2].length;
            if (fenceDepth === 0) fenceDepth = count;
            else if (count >= fenceDepth) fenceDepth = 0;
            return line;
          }
          if (fenceDepth > 0) return line;

          // < (JSX 태그가 아닌 것) → &lt;
          // { } → \{ \}  (JSX 표현식 오인 방지)
          line = line.replace(
            /(`[^`]*`|\\[{}])|<(?![a-zA-Z\/])|([{}])/g,
            (m, prot, brace) => {
              if (prot !== undefined) return prot;
              if (brace) return brace === "{" ? "\\{" : "\\}";
              return "&lt;";
            },
          );

          // import/export 로 시작하는 줄은 MDX가 ESM으로 파싱하므로 ZWS로 방어
          if (/^(import|export)\s/.test(line)) line = "​" + line;

          return line;
        })
        .join("\n");
    }

    // Process images
    markdownBody = await processImages(markdownBody, page.id);

    // Write file
    const fileContent = matter.stringify(markdownBody, fm);
    fs.writeFileSync(filePath, fileContent, "utf-8");

    if (isNew) stats.created++;
    else stats.updated++;

    if (!MOCK_MODE) await delay(350);
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
