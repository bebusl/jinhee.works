import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  getWebhookPageId,
  shouldInvalidateIndex,
  verifyNotionWebhookSignature,
} from "../lib/notion-webhook.ts";

test("validates a Notion HMAC signature using the raw body", () => {
  const body = JSON.stringify({ type: "page.content_updated" });
  const secret = "test-secret";
  const signature = `sha256=${createHmac("sha256", secret)
    .update(body)
    .digest("hex")}`;

  assert.equal(verifyNotionWebhookSignature(body, signature, secret), true);
  assert.equal(verifyNotionWebhookSignature(body, "sha256=invalid", secret), false);
});

test("extracts page ids and handles events that always affect the index", () => {
  assert.equal(
    getWebhookPageId({ entity: { type: "page", id: "page-id" } }),
    "page-id",
  );
  assert.equal(shouldInvalidateIndex({ type: "page.deleted" }), true);
  assert.equal(
    shouldInvalidateIndex({ entity: { type: "data_source", id: "source-id" } }),
    true,
  );
});
