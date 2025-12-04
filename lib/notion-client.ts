import {
  Client,
  DataSourceObjectResponse,
  PageObjectResponse,
  PartialDataSourceObjectResponse,
  PartialPageObjectResponse,
  type RichTextItemResponse,
} from "@notionhq/client";

// Initializing a client
const notionClient = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DEV_LOG_DATA_SOURCE_ID = "94edad16-bfce-4c81-995e-37ce759ef006";

// export type ResponseType = {
//   created_time: string;
//   last_edited_time: string;
//   properties: {
//     title: {
//       id: "title";
//       title: RichTextItemResponse[];
//     };
//   };
// };

export const notionIntegrationTest = async () => {
  const res = await notionClient.dataSources.query({
    data_source_id: DEV_LOG_DATA_SOURCE_ID,
    filter: {
      property: "%7Dl%3F%7C", // id로 해야 함
      select: {
        equals: "블로그",
      },
    },
  });

  const results = res.results;

  if (!isPageObjectResponse(results)) {
    throw Error("Page 형식이 아닙니다.");
  }

  return results;
};

const isPageObjectResponse = (
  result: (
    | PageObjectResponse
    | PartialPageObjectResponse
    | PartialDataSourceObjectResponse
    | DataSourceObjectResponse
  )[]
): result is PageObjectResponse[] => {
  console.log(result[0]);
  if (result[0].object === "page") return true;
  return false;
};
