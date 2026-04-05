/**
 * Simple markdown renderer — no external dependency
 * Converts basic markdown to React elements with dark mode support
 */

type MarkdownProps = { content: string; className?: string };

export function Markdown({ content, className = '' }: MarkdownProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let inBlockquote = false;
  let quoteLines: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2 text-gray-700 dark:text-stone-300">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushQuote = () => {
    if (quoteLines.length > 0) {
      elements.push(
        <blockquote key={`quote-${elements.length}`} className="border-l-4 border-orange-300 dark:border-orange-700 pl-4 py-2 my-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-r-lg text-gray-600 dark:text-stone-400 italic">
          {quoteLines.map((line, i) => <p key={i}>{line.replace(/^>\s?/, '')}</p>)}
        </blockquote>
      );
      quoteLines = [];
      inBlockquote = false;
    }
  };

  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900 dark:text-stone-100">{part}</strong> : part
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('>')) {
      flushList();
      inBlockquote = true;
      quoteLines.push(line);
      continue;
    } else if (inBlockquote) {
      flushQuote();
    }

    if (line.trim() === '') {
      flushList();
      continue;
    }

    if (line.trim() === '---') {
      flushList();
      elements.push(<hr key={`hr-${elements.length}`} className="my-4 border-gray-200 dark:border-stone-700" />);
      continue;
    }

    if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={`h3-${elements.length}`} className="text-lg font-semibold text-gray-800 dark:text-stone-200 mt-4 mb-2">{renderInline(line.slice(4))}</h3>);
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={`h2-${elements.length}`} className="text-xl font-bold text-gray-800 dark:text-stone-100 mt-5 mb-3">{renderInline(line.slice(3))}</h2>);
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={`h1-${elements.length}`} className="text-2xl font-bold text-gray-900 dark:text-stone-50 mt-5 mb-3">{renderInline(line.slice(2))}</h1>);
      continue;
    }

    if (line.match(/^[-*]\s/)) {
      inList = true;
      listItems.push(<li key={`li-${elements.length}-${listItems.length}`}>{renderInline(line.slice(2))}</li>);
      continue;
    } else if (inList) {
      flushList();
    }

    flushList();
    elements.push(<p key={`p-${elements.length}`} className="text-gray-700 dark:text-stone-300 leading-relaxed my-1">{renderInline(line)}</p>);
  }

  flushList();
  flushQuote();

  return <div className={className}>{elements}</div>;
}
