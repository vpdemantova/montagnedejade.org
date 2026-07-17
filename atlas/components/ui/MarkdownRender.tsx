"use client"

import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-display font-bold text-solar-text mb-6 mt-2 leading-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-display font-semibold text-solar-text mb-3 mt-8 uppercase tracking-widest text-[11px] text-solar-accent/80">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-display font-semibold text-solar-text mb-2 mt-6">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-[13px] text-solar-text/70 leading-relaxed mb-4">
      {children}
    </p>
  ),
  em: ({ children }) => (
    <em className="text-solar-text/50 not-italic font-light">{children}</em>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-solar-text">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 space-y-1.5 pl-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 space-y-1.5 pl-0 list-none counter-reset-item">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex gap-2.5 text-[13px] text-solar-text/70 leading-relaxed">
      <span className="text-solar-accent/50 mt-1 flex-shrink-0">—</span>
      <span>{children}</span>
    </li>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-")
    if (isBlock) {
      return (
        <code className="block text-[11px] font-mono text-solar-text/60 bg-solar-surface/40 border border-solar-border/20 p-4 rounded overflow-x-auto whitespace-pre leading-relaxed">
          {children}
        </code>
      )
    }
    return (
      <code className="text-[11px] font-mono text-solar-accent/80 bg-solar-surface/40 px-1.5 py-0.5 rounded">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto">{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-solar-accent/30 pl-4 my-4 italic text-solar-text/50 text-[13px]">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="border-0 border-t border-solar-border/20 my-8" />
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-[12px] font-mono">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-solar-border/30">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left text-[10px] uppercase tracking-widest text-solar-muted/60 pb-2 pr-4 font-normal">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="text-solar-text/60 py-2 pr-4 border-b border-solar-border/10 align-top">
      {children}
    </td>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-solar-accent/70 hover:text-solar-accent underline underline-offset-2 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
}

export function MarkdownRender({ content }: { content: string }) {
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>
}
