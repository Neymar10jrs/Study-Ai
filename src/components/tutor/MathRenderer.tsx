import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  content: string;
  className?: string;
  block?: boolean;
}

export function MathRenderer({ content, className = "", block = false }: MathRendererProps) {
  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(content, {
        displayMode: block,
        throwOnError: false,
      });
    } catch (e) {
      return null;
    }
  }, [content, block]);

  if (renderedHtml) {
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  return <code className={`font-mono text-orange-300 ${className}`}>{content}</code>;
}

/**
 * FormattedContent handles mixed text containing markdown bold, lists, code blocks,
 * and inline math like $x^2 + y^2 = r^2$ or block math like $$E = mc^2$$.
 */
export function FormattedContent({ text, className = "" }: { text: string; className?: string }) {
  const parts = useMemo(() => {
    if (!text) return [];

    // Simple parser for $$block math$$ and $inline math$
    const tokens: { type: "text" | "inline-math" | "block-math" | "code"; value: string }[] = [];
    let remaining = text;

    // Check code blocks ``` first
    const codeBlockRegex = /```([\s\S]*?)```/g;
    let lastIdx = 0;
    let match;

    const parseMathAndText = (chunk: string) => {
      // Split by $$...$$
      const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
      let bLast = 0;
      let bMatch;

      while ((bMatch = blockMathRegex.exec(chunk)) !== null) {
        if (bMatch.index > bLast) {
          parseInlineMath(chunk.substring(bLast, bMatch.index));
        }
        tokens.push({ type: "block-math", value: bMatch[1].trim() });
        bLast = blockMathRegex.lastIndex;
      }
      if (bLast < chunk.length) {
        parseInlineMath(chunk.substring(bLast));
      }
    };

    const parseInlineMath = (chunk: string) => {
      // Split by $...$ (ensuring not double $)
      const inlineMathRegex = /(?<!\$)\$(?!\$)([^\n]+?)(?<!\$)\$(?!\$)/g;
      let iLast = 0;
      let iMatch;

      while ((iMatch = inlineMathRegex.exec(chunk)) !== null) {
        if (iMatch.index > iLast) {
          tokens.push({ type: "text", value: chunk.substring(iLast, iMatch.index) });
        }
        tokens.push({ type: "inline-math", value: iMatch[1].trim() });
        iLast = inlineMathRegex.lastIndex;
      }
      if (iLast < chunk.length) {
        tokens.push({ type: "text", value: chunk.substring(iLast) });
      }
    };

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parseMathAndText(text.substring(lastIdx, match.index));
      }
      tokens.push({ type: "code", value: match[1] });
      lastIdx = codeBlockRegex.lastIndex;
    }
    if (lastIdx < text.length) {
      parseMathAndText(text.substring(lastIdx));
    }

    return tokens;
  }, [text]);

  return (
    <div className={`space-y-2 leading-relaxed ${className}`}>
      {parts.map((token, index) => {
        if (token.type === "block-math") {
          return (
            <div key={index} className="my-2 p-2 rounded-lg bg-black/40 overflow-x-auto text-center border border-white/5">
              <MathRenderer content={token.value} block={true} />
            </div>
          );
        }
        if (token.type === "inline-math") {
          return <MathRenderer key={index} content={token.value} block={false} />;
        }
        if (token.type === "code") {
          return (
            <pre key={index} className="p-3 my-2 bg-black/60 rounded-xl overflow-x-auto text-xs sm:text-sm font-mono text-orange-200 border border-white/10">
              <code>{token.value}</code>
            </pre>
          );
        }

        // Render plain text with basic line breaks and bold formatting
        const lines = token.value.split("\n");
        return (
          <span key={index}>
            {lines.map((line, lIdx) => {
              // Parse **bold** inside line
              const boldParts = line.split(/(\*\*.*?\*\*)/g);
              return (
                <React.Fragment key={lIdx}>
                  {boldParts.map((bPart, bIdx) => {
                    if (bPart.startsWith("**") && bPart.endsWith("**")) {
                      return (
                        <strong key={bIdx} className="text-white font-semibold">
                          {bPart.slice(2, -2)}
                        </strong>
                      );
                    }
                    return <span key={bIdx}>{bPart}</span>;
                  })}
                  {lIdx < lines.length - 1 && <br />}
                </React.Fragment>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}
