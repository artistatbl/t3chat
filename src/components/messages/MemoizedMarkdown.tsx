import { memo, useMemo, useState, createContext, useContext } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { marked } from "marked";
import ShikiHighlighter from "react-shiki";
import type { ComponentProps } from "react";
import type { ExtraProps } from "react-markdown";
import { Copy } from "lucide-react";
import { toast } from "sonner";

type CodeComponentProps = ComponentProps<"code"> & ExtraProps;
type MarkdownSize = "default" | "small";

// Context to pass size down to components
const MarkdownSizeContext = createContext<MarkdownSize>("default");

const components: Components = {
  code: CodeBlock as Components["code"],
  pre: ({ children }) => <>{children}</>,
};

function CodeBlock({ children, className, ...props }: CodeComponentProps) {
  const size = useContext(MarkdownSizeContext);
  const match = /language-(\w+)/.exec(className || "");

  if (match) {
    const lang = match[1] || "text";
    return (
      <div className="my-4">
        <Codebar lang={lang} codeString={String(children)} />
        <div className="relative">
          <ShikiHighlighter
            language={lang}
            theme={"vesper"}
            className="text-sm  font-mono overflow-x-auto"
            showLanguage={false}
          >
            {String(children)}
          </ShikiHighlighter>
        </div>
      </div>
    );
  }
//synthwave-84
//vesper

  const inlineCodeClasses =
    size === "small"
      ? "mx-1 px-2 py-0.5 bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-800 dark:text-fuchsia-200 font-mono text-xs "
      : "mx-1 px-2 py-1 bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-800 dark:text-fuchsia-200 font-mono text-sm ";

  return (
    <code className={inlineCodeClasses} {...props}>
      {children}
    </code>
  );
}

function Codebar({ lang, codeString }: { lang: string; codeString: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      toast.success(`${lang} code copied to clipboard`);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code to clipboard:", error);
      toast.error("Failed to copy code to clipboard");
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-3 dark:bg-fuchsia-950/20 bg-fuchsia-950/30  ">
      <span className="text-sm font-semibold text-black dark:text-white font-mono tracking-wide">
        {lang}
      </span>
      <button
        onClick={copyToClipboard}
        className="flex items-center cursor-pointer gap-2 text-sm"
        title={copied ? "Copied!" : "Copy code"}
      >
        <>
          <Copy className="w-4 h-4" />
        </>
      </button>
    </div>
  );
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

function PureMarkdownRendererBlock({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, [remarkMath]]}
      rehypePlugins={[rehypeKatex]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}

const MarkdownRendererBlock = memo(
  PureMarkdownRendererBlock,
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  }
);

MarkdownRendererBlock.displayName = "MarkdownRendererBlock";

const MemoizedMarkdown = memo(
  ({
    content,
    id,
    size = "default",
  }: {
    content: string;
    id: string;
    size?: MarkdownSize;
  }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    const proseClasses =
      size === "small"
        ? "prose prose-sm dark:prose-invert break-words max-w-none w-full prose-code:before:content-none prose-code:after:content-none prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent"
        : "prose prose-base dark:prose-invert break-words max-w-none w-full prose-code:before:content-none prose-code:after:content-none prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent";

    return (
      <MarkdownSizeContext.Provider value={size}>
        <div className={proseClasses}>
          {blocks.map((block, index) => (
            <MarkdownRendererBlock
              content={block}
              key={`${id}-block-${index}`}
            />
          ))}
        </div>
      </MarkdownSizeContext.Provider>
    );
  }
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";

export default MemoizedMarkdown;
