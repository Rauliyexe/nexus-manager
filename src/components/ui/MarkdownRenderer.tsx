'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

/**
 * Parses inline formatting like **bold**, *italic*, `code`, and [TASK-XXXX] tags.
 */
function renderInline(text: string, keyPrefix: string, isUser = false): React.ReactNode[] {
  // Regex matches:
  // 1. `code`
  // 2. ***bold italic***
  // 3. **bold**
  // 4. *italic*
  // 5. [TASK-XXXX] or [INC-XXXX]
  const inlineRegex = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|\[(?:TASK|INC|REQ)-\d+\])/g;

  const parts = text.split(inlineRegex);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (!part) return null;

    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeContent = part.slice(1, -1);
      return (
        <code
          key={key}
          className={`font-mono text-[11px] px-1.5 py-0.5 rounded-md border ${
            isUser
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-[#EEF2EE] dark:bg-[#1C2E24] text-emerald-800 dark:text-emerald-300 border-[#D5E0D7] dark:border-[#1E3125]'
          }`}
        >
          {codeContent}
        </code>
      );
    }

    // Bold + Italic: ***text***
    if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
      const inner = part.slice(3, -3);
      return (
        <strong key={key} className={`font-extrabold italic ${isUser ? 'text-white' : 'text-[#111D15] dark:text-white'}`}>
          {inner}
        </strong>
      );
    }

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={key} className={`font-bold ${isUser ? 'text-white font-extrabold' : 'text-[#111D15] dark:text-slate-100 font-extrabold'}`}>
          {renderInline(inner, `${key}-inner`, isUser)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={key} className="italic">
          {inner}
        </em>
      );
    }

    // Task badge: [TASK-XXXX] or [INC-XXXX]
    if (part.startsWith('[') && part.endsWith(']') && /\[(TASK|INC|REQ)-\d+\]/.test(part)) {
      return (
        <span
          key={key}
          className={`inline-block font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded-md border mx-0.5 ${
            isUser
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
          }`}
        >
          {part}
        </span>
      );
    }

    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

/**
 * Lightweight and complete Markdown Renderer for chat messages and copilot reasoning.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  isUser = false,
}) => {
  if (!content) return null;

  // Split lines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code Block ``` ... ```
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <div key={`code-block-${i}`} className="my-2.5 rounded-xl overflow-hidden border border-[#1E3125] bg-[#0B120E] text-slate-200">
          {lang && (
            <div className="px-3 py-1 bg-[#121D16] border-b border-[#1E3125] text-[10px] font-mono text-[#76B38B] font-bold">
              {lang.toUpperCase()}
            </div>
          )}
          <pre className="p-3 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    // 2. Blockquote (> text)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className={`my-2 pl-3 py-1.5 border-l-2 rounded-r-xl text-xs ${
            isUser
              ? 'border-white/50 bg-white/10 text-white/90 italic'
              : 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-[#111D15] dark:text-slate-200 font-medium'
          }`}
        >
          {quoteLines.map((q, qIdx) => (
            <p key={qIdx} className="leading-relaxed">
              {renderInline(q, `q-${i}-${qIdx}`, isUser)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // 3. Headings (#, ##, ###, ####)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      const inlineHeading = renderInline(headingText, `h-${i}`, isUser);

      if (level === 1) {
        elements.push(
          <h2 key={`h1-${i}`} className="text-sm font-extrabold text-[#111D15] dark:text-white mt-3 mb-1 tracking-tight">
            {inlineHeading}
          </h2>
        );
      } else if (level === 2) {
        elements.push(
          <h3 key={`h2-${i}`} className="text-xs font-extrabold text-[#111D15] dark:text-white mt-2.5 mb-1 tracking-tight">
            {inlineHeading}
          </h3>
        );
      } else {
        elements.push(
          <h4 key={`h3-${i}`} className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mt-2 mb-0.5 flex items-center space-x-1">
            <span>{inlineHeading}</span>
          </h4>
        );
      }
      i++;
      continue;
    }

    // 4. Unordered List Items (•, *, -)
    if (/^[•*-]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[•*-]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[•*-]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-1.5 space-y-1 pl-1">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start space-x-2 text-xs leading-relaxed">
              <span className={`shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${isUser ? 'bg-white' : 'bg-emerald-600 dark:bg-emerald-400'}`} />
              <span className="flex-1">{renderInline(item, `ul-${i}-${itemIdx}`, isUser)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 5. Ordered List Items (1., 2., etc)
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: { num: string; text: string }[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemLine = lines[i].trim();
        const match = itemLine.match(/^(\d+)\.\s+(.+)$/);
        if (match) {
          listItems.push({ num: match[1], text: match[2] });
        } else {
          listItems.push({ num: String(listItems.length + 1), text: itemLine });
        }
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1.5 pl-0.5">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start space-x-2 text-xs leading-relaxed">
              <span
                className={`font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded shrink-0 mt-0.5 border ${
                  isUser
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-[#EEF2EE] dark:bg-[#1C2E24] text-emerald-800 dark:text-emerald-300 border-[#D5E0D7] dark:border-[#1E3125]'
                }`}
              >
                {item.num}.
              </span>
              <span className="flex-1">{renderInline(item.text, `ol-${i}-${itemIdx}`, isUser)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 6. Blank line / Paragraph separator
    if (trimmed === '') {
      elements.push(<div key={`blank-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // 7. Regular paragraph line
    elements.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {renderInline(line, `p-${i}`, isUser)}
      </p>
    );
    i++;
  }

  return (
    <div className={`space-y-1 text-xs ${className}`}>
      {elements}
    </div>
  );
};
