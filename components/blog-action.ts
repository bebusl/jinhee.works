"use server";

import { notionIntegrationTest } from "@/lib/notion-client";

export const fetchData = async () => {
  "use server";
  return await notionIntegrationTest();
};
