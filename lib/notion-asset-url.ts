import { createHash } from "node:crypto";

export function notionAssetObjectKey(pageId: string, sourceUrl: string) {
  const pathname = new URL(sourceUrl).pathname;
  const extension = pathname.match(/\.([a-z0-9]{1,8})$/i)?.[1] ?? "bin";
  const hash = createHash("sha256").update(pathname).digest("hex").slice(0, 24);
  return `blog/${pageId}/${hash}.${extension.toLowerCase()}`;
}

export function rewriteNotionAssetUrls(
  markdown: string,
  pageId: string,
  publicBaseUrl?: string,
) {
  if (!publicBaseUrl) return markdown;
  const baseUrl = publicBaseUrl.replace(/\/$/, "");

  return markdown.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,
    (_match, alt: string, sourceUrl: string) =>
      `![${alt}](${baseUrl}/${notionAssetObjectKey(pageId, sourceUrl)})`,
  );
}
