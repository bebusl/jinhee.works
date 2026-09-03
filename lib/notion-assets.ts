import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getPostMarkdownUncached } from "@/lib/notion";
import {
  notionAssetObjectKey,
  rewriteNotionAssetUrls as rewriteUrls,
} from "@/lib/notion-asset-url";

const imagePattern = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

function assetConfig() {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) return null;

  return {
    bucket,
    region,
    publicBaseUrl:
      process.env.AWS_S3_PUBLIC_BASE_URL?.replace(/\/$/, "") ??
      `https://${bucket}.s3.${region}.amazonaws.com`,
  };
}

export function rewriteNotionAssetUrls(markdown: string, pageId: string) {
  const config = assetConfig();
  return rewriteUrls(markdown, pageId, config?.publicBaseUrl);
}

/**
 * Copies images referenced by the latest Notion Markdown response to S3 before
 * its page cache is invalidated. It is intentionally called by webhooks, never
 * by page visitors.
 */
export async function syncNotionAssets(pageId: string) {
  const config = assetConfig();
  if (!config) return { uploaded: 0, skipped: true };

  const markdown = await getPostMarkdownUncached(pageId);
  const sourceUrls = Array.from(markdown.markdown.matchAll(imagePattern)).map(
    (match) => match[2],
  );
  const s3 = new S3Client({ region: config.region });

  await Promise.all(
    sourceUrls.map(async (sourceUrl) => {
      const source = await fetch(sourceUrl, { cache: "no-store" });
      if (!source.ok) {
        throw new Error(`Notion 이미지 다운로드 실패 (${source.status})`);
      }

      await s3.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: notionAssetObjectKey(pageId, sourceUrl),
          Body: Buffer.from(await source.arrayBuffer()),
          ContentType: source.headers.get("content-type") ?? undefined,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
    }),
  );

  return { uploaded: sourceUrls.length, skipped: false };
}
