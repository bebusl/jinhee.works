import { createHash } from "node:crypto";
import { Client } from "@notionhq/client";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} 환경 변수가 필요합니다.`);
  return value;
};

const notion = new Client({
  auth: required("NOTION_TOKEN"),
  notionVersion: "2026-03-11",
});
const region = required("AWS_REGION");
const bucket = required("AWS_S3_BUCKET");
const s3 = new S3Client({ region });
const imagePattern = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g;

function objectKey(pageId, sourceUrl) {
  const pathname = new URL(sourceUrl).pathname;
  const extension = pathname.match(/\.([a-z0-9]{1,8})$/i)?.[1] ?? "bin";
  const hash = createHash("sha256").update(pathname).digest("hex").slice(0, 24);
  return `blog/${pageId}/${hash}.${extension.toLowerCase()}`;
}

async function publishedPages() {
  const pages = [];
  let start_cursor;

  do {
    const response = await notion.dataSources.query({
      data_source_id: required("NOTION_DATA_SOURCE_ID"),
      page_size: 100,
      ...(start_cursor ? { start_cursor } : {}),
      filter: {
        and: [
          { property: "타입", select: { equals: "블로그" } },
          { property: "상태", status: { equals: "완료" } },
        ],
      },
    });
    pages.push(...response.results);
    start_cursor = response.next_cursor ?? undefined;
  } while (start_cursor);

  return pages;
}

async function syncPage(pageId) {
  const response = await notion.pages.retrieveMarkdown({ page_id: pageId });
  const urls = Array.from(response.markdown.matchAll(imagePattern)).map(
    (match) => match[1],
  );

  await Promise.all(
    urls.map(async (sourceUrl) => {
      const response = await fetch(sourceUrl);
      if (!response.ok) throw new Error(`이미지 다운로드 실패: ${response.status}`);
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: objectKey(pageId, sourceUrl),
          Body: Buffer.from(await response.arrayBuffer()),
          ContentType: response.headers.get("content-type") ?? undefined,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
    }),
  );

  return urls.length;
}

const pages = await publishedPages();
let total = 0;
for (const page of pages) {
  total += await syncPage(page.id);
}
console.log(`S3에 ${pages.length}개 글의 이미지 ${total}개를 동기화했습니다.`);
