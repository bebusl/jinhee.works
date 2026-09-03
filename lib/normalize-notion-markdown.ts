export interface NormalizeNotionMarkdownOptions {
  truncated?: boolean;
  unknownBlockIds?: string[];
}

export interface NormalizedNotionMarkdown {
  markdown: string;
  warnings: string[];
}

function attribute(attributes: string, name: string) {
  const match = attributes.match(
    new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"),
  );
  return match?.[1] ?? "";
}

function escapeMdxAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/[{}]/g, "\\$&");
}

function fallbackLink(attributes: string, label: string) {
  const url = attribute(attributes, "url") || attribute(attributes, "src");
  return url ? `[${label}](${url})` : label;
}

/**
 * Converts the subset of Notion-flavored Markdown used by this site into
 * MDX that can be compiled by next-mdx-remote without losing source content.
 */
export function normalizeNotionMarkdown(
  source: string,
  options: NormalizeNotionMarkdownOptions = {},
): NormalizedNotionMarkdown {
  const warnings: string[] = [];
  let markdown = source.replace(/<empty-block\s*\/>/gi, "");

  markdown = markdown.replace(
    /<callout\b([^>]*)>([\s\S]*?)<\/callout>/gi,
    (_match, attributes: string, body: string) => {
      const icon = escapeMdxAttribute(attribute(attributes, "icon") || "💡");
      return `<Callout icon="${icon}">\n${body.trim()}\n</Callout>`;
    },
  );

  markdown = markdown.replace(
    /<details\b[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*([\s\S]*?)<\/details>/gi,
    (_match, title: string, body: string) =>
      `<Toggle title="${escapeMdxAttribute(title.trim())}">\n${body.trim()}\n</Toggle>`,
  );

  markdown = markdown.replace(
    /<(?:page|database)\b([^>]*)>([\s\S]*?)<\/(?:page|database)>/gi,
    (_match, attributes: string, label: string) =>
      fallbackLink(attributes, label.trim() || "Notion 참조"),
  );

  markdown = markdown.replace(
    /<image\b([^>]*)\/>/gi,
    (_match, attributes: string) => {
      const src = attribute(attributes, "src") || attribute(attributes, "url");
      const alt = attribute(attributes, "alt") || "Notion 이미지";
      return src ? `![${alt}](${src})` : "[Notion 이미지]";
    },
  );

  markdown = markdown.replace(
    /<(?:audio|video|file|pdf|embed|bookmark)\b([^>]*)\/>/gi,
    (_match, attributes: string) => fallbackLink(attributes, "Notion 첨부 파일"),
  );

  markdown = markdown.replace(
    /<unknown\b([^>]*)\/>/gi,
    (_match, attributes: string) => {
      warnings.push("Notion이 지원하지 않는 블록을 반환했습니다.");
      return `> 지원하지 않는 Notion 블록: ${fallbackLink(attributes, "원본 보기")}`;
    },
  );

  markdown = markdown
    .replace(/<table_of_contents\b[^>]*\/>/gi, "")
    .replace(/<\/?(?:columns|column|synced_block)\b[^>]*>/gi, "")
    .replace(/<span\b[^>]*color=[^>]*>/gi, "<span>")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (options.truncated) {
    warnings.push("Notion이 큰 페이지의 일부 블록을 생략했습니다.");
  }
  if (options.unknownBlockIds?.length) {
    warnings.push(
      `확인하지 못한 Notion 블록 ${options.unknownBlockIds.length}개가 있습니다.`,
    );
  }

  if (warnings.length) {
    markdown = `${markdown}\n\n> ${warnings.join(" ")}`.trim();
  }

  return { markdown, warnings };
}
