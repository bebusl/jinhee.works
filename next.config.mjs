import createMdx from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // mdx
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMdx({
  // 원래는 mdx만 컴파일 가능. md도 컴파일 가능하도록 수정
  extension: /\.(md|mdx)$/,
});

export default withMDX(nextConfig);
