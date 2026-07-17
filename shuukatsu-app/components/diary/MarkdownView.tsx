import { Fragment, ReactNode } from "react";

/**
 * スキルの分析結果（Markdown）を表示するための簡易レンダラー。
 * 見出し・引用・箇条書き・番号リスト・太字・区切り線だけを扱う
 * （スキルの出力フォーマットで使われる記法のみ対応）。
 */
export function MarkdownView({ markdown }: { markdown: string }) {
  const blocks: ReactNode[] = [];
  const lines = markdown.split(/\r?\n/);
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="text-base font-bold text-[#0e2149] mt-5 mb-2">
          {inline(line.slice(4))}
        </h3>
      );
      i++;
    } else if (line.startsWith("## ")) {
      blocks.push(
        <h2
          key={key++}
          className="text-lg font-black text-[#0e2149] mt-6 mb-2 pb-1 border-b-2 border-[#ff7a1a]/40"
        >
          {inline(line.slice(3))}
        </h2>
      );
      i++;
    } else if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quote.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="border-l-4 border-[#ff7a1a] bg-orange-50 px-3 py-2 rounded text-gray-600 text-sm my-2"
        >
          {quote.map((q, qi) => (
            <p key={qi}>{inline(q)}</p>
          ))}
        </blockquote>
      );
    } else if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-5 space-y-1.5 my-2 text-sm text-gray-700">
          {items.map((item, li) => (
            <li key={li}>{inline(item)}</li>
          ))}
        </ul>
      );
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal pl-5 space-y-1.5 my-2 text-sm text-gray-700">
          {items.map((item, li) => (
            <li key={li}>{inline(item)}</li>
          ))}
        </ol>
      );
    } else if (/^-{3,}$/.test(line.trim())) {
      blocks.push(<hr key={key++} className="my-4 border-gray-200" />);
      i++;
    } else {
      blocks.push(
        <p key={key++} className="text-sm text-gray-700 leading-7 my-2">
          {inline(line)}
        </p>
      );
      i++;
    }
  }

  return <div>{blocks}</div>;
}

/** 行内の **太字** だけを <strong> に変換する。 */
function inline(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, index) => (
    <Fragment key={index}>
      {index % 2 === 1 ? (
        <strong className="font-bold text-gray-900">{part}</strong>
      ) : (
        part
      )}
    </Fragment>
  ));
}
