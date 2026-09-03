import assert from "node:assert/strict";
import test from "node:test";
import { normalizeNotionMarkdown } from "../lib/normalize-notion-markdown.ts";

test("normalizes Notion blocks used by the MDX renderer", () => {
  const result = normalizeNotionMarkdown(`
<empty-block/>
<callout icon="⚠️" color="yellow_bg">주의 내용</callout>
<details><summary>더 보기</summary>숨겨진 내용</details>
<page url="https://notion.so/page">관련 페이지</page>
<table_of_contents color="gray"/>
`);

  assert.match(result.markdown, /<Callout icon="⚠️">/);
  assert.match(result.markdown, /<Toggle title="더 보기">/);
  assert.match(result.markdown, /\[관련 페이지\]\(https:\/\/notion\.so\/page\)/);
  assert.doesNotMatch(result.markdown, /empty-block|table_of_contents/);
});

test("keeps an explicit warning for incomplete Markdown responses", () => {
  const result = normalizeNotionMarkdown("본문", {
    truncated: true,
    unknownBlockIds: ["block-a", "block-b"],
  });

  assert.equal(result.warnings.length, 2);
  assert.match(result.markdown, /일부 블록을 생략했습니다/);
  assert.match(result.markdown, /2개/);
});

test("makes Notion HTML line breaks valid MDX", () => {
  const result = normalizeNotionMarkdown("강조된 문장<br>다음 줄");

  assert.equal(result.markdown, "강조된 문장<br />다음 줄");
});
