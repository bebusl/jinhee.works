import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      className="max-w-full rounded-lg"
      {...props}
    />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
