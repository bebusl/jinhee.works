import { createHmac, timingSafeEqual } from "node:crypto";

export type NotionWebhookEvent = {
  type?: string;
  entity?: { id?: string; type?: string };
};

export function verifyNotionWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret = process.env.NOTION_WEBHOOK_SECRET,
) {
  if (!secret || !signature?.startsWith("sha256=")) return false;

  const expected = `sha256=${createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")}`;
  const received = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    received.length === expectedBuffer.length &&
    timingSafeEqual(received, expectedBuffer)
  );
}

export function getWebhookPageId(event: NotionWebhookEvent) {
  return event.entity?.type === "page" ? event.entity.id ?? null : null;
}

export function shouldInvalidateIndex(event: NotionWebhookEvent) {
  return event.entity?.type === "data_source" || event.type === "page.deleted";
}
