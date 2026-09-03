import { revalidateTag } from "next/cache";
import { notionCacheTags, isPublishedBlogPost } from "@/lib/posts";
import {
  getWebhookPageId,
  shouldInvalidateIndex,
  verifyNotionWebhookSignature,
  type NotionWebhookEvent,
} from "@/lib/notion-webhook";
import { syncNotionAssets } from "@/lib/notion-assets";

export async function POST(req: Request) {
  const rawBody = await req.text();

  let body: NotionWebhookEvent;
  try {
    body = JSON.parse(rawBody) as NotionWebhookEvent;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Notion sends this one-time payload while a subscription is being verified.
  if ("verification_token" in body) {
    return Response.json({ ok: true });
  }

  if (
    !verifyNotionWebhookSignature(
      rawBody,
      req.headers.get("x-notion-signature"),
    )
  ) {
    return Response.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  const pageId = getWebhookPageId(body);
  let indexInvalidated = shouldInvalidateIndex(body);

  if (pageId) {
    revalidateTag(notionCacheTags.post(pageId), { expire: 0 });

    try {
      const isPublished = await isPublishedBlogPost(pageId);
      indexInvalidated ||= isPublished;
      if (isPublished) await syncNotionAssets(pageId);
    } catch {
      // A deleted or inaccessible page can no longer be queried. Revalidate
      // the list so it is removed from the next rendered index.
      indexInvalidated = true;
    }
  }

  if (indexInvalidated) {
    revalidateTag(notionCacheTags.index, { expire: 0 });
  }

  return Response.json({ ok: true, pageId, indexInvalidated });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
