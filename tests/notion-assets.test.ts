import assert from "node:assert/strict";
import test from "node:test";
import { rewriteNotionAssetUrls } from "../lib/notion-asset-url.ts";

test("rewrites Notion image URLs to the configured S3 public base", () => {
  const result = rewriteNotionAssetUrls(
    "![표지](https://secure.notion-static.com/path/cover.png?signature=one)",
    "page-id",
    "https://cdn.example.com",
  );

  assert.match(result, /^!\[표지\]\(https:\/\/cdn\.example\.com\/blog\/page-id\/[a-f0-9]{24}\.png\)$/);

});
