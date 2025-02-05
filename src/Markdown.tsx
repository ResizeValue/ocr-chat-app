// MarkdownWithMath.tsx
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import dynamic from "next/dynamic";
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

import "katex/dist/katex.min.css";

interface MarkdownWithMathProps {
  markdownContent: string;
}

const MarkdownWithMath = ({ markdownContent }: MarkdownWithMathProps) => {
  function convertMathSyntax(markdown: string): string {
    return (
      markdown
        // Convert \[...\] to $$...$$ (block math)
        .replace(/\\\[(.*?)\\\]/gs, (_, expr) => `$$${expr}$$`)
        // Convert \(...\) to $...$ (inline math)
        .replace(/\\\((.*?)\\\)/gs, (_, expr) => `$${expr}$`)
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "1rem auto", lineHeight: 1.5 }}>
      <ReactMarkdown
        // This plugin recognizes \(...\) / \[...\] as math
        remarkPlugins={[remarkMath]}
        // This plugin renders the math with KaTeX
        rehypePlugins={[rehypeKatex]}
      >
        {convertMathSyntax(markdownContent)}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownWithMath;
