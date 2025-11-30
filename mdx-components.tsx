import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {};

/**
 * @TODO MDX컴포넌트 스타일링 (참조 : s/mdx#using-custom-styles-and-components)
 * @link https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components
 */
export function useMDXComponents(): MDXComponents {
  return components;
}
