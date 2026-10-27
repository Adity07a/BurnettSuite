import { Fragment } from "react";

function Inline({ text }) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("`") ? <code key={index} className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[0.9em]">{part.slice(1, -1)}</code>
      : part.startsWith("**") ? <strong key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
        : <Fragment key={index}>{part}</Fragment>);
}

// Render model text as React elements; never interpret it as HTML.
export default function AssistantMessage({ content }) {
  const lines = content.split("\n");
  const blocks = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) code.push(lines[index++]);
      index += 1;
      blocks.push(<div key={blocks.length} className="my-4 overflow-hidden rounded-xl bg-slate-950 text-slate-100"><div className="border-b border-slate-800 px-4 py-2 text-xs text-slate-400">{language || "Code"}</div><pre className="overflow-x-auto p-4 text-sm leading-6"><code>{code.join("\n")}</code></pre></div>);
    } else if (/^#{1,6}\s/.test(line)) {
      blocks.push(<h3 key={blocks.length} className="mb-2 mt-5 text-base font-bold text-slate-900"><Inline text={line.replace(/^#{1,6}\s+/, "")} /></h3>);
      index += 1;
    } else if (/^\s*(?:[-*]|\d+\.)\s/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      const pattern = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/;
      while (index < lines.length && pattern.test(lines[index])) items.push(<li key={items.length}><Inline text={lines[index++].replace(pattern, "")} /></li>);
      const Tag = ordered ? "ol" : "ul";
      blocks.push(<Tag key={blocks.length} className={`my-3 space-y-2 pl-5 ${ordered ? "list-decimal" : "list-disc"}`}>{items}</Tag>);
    } else if (!line.trim()) {
      index += 1;
    } else {
      const paragraph = [line];
      index += 1;
      while (index < lines.length && lines[index].trim() && !/^(?:```|#{1,6}\s|\s*[-*]\s|\s*\d+\.\s)/.test(lines[index])) paragraph.push(lines[index++]);
      blocks.push(<p key={blocks.length} className="my-3 whitespace-pre-wrap"><Inline text={paragraph.join("\n")} /></p>);
    }
  }
  return <div className="min-w-0 break-words text-sm leading-7 text-slate-700">{blocks}</div>;
}
