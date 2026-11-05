"use client";

// Lightweight line-based syntax highlighter for the generated artifacts.
// Colors: comments zinc, yaml keys rose, strings emerald, numbers/booleans amber.

import { Fragment, type ReactNode } from "react";

export type CodeLanguage = "yaml" | "ruby" | "bash";

const TOKEN_RE = /('[^']*'|"[^"]*"|\b\d+\b|\btrue\b|\bfalse\b|\bnull\b)/g;

function renderSegment(text: string, keyPrefix: string): ReactNode[] {
  if (!text) return [];
  const parts = text.split(TOKEN_RE);
  const out: ReactNode[] = [];
  parts.forEach((part, i) => {
    if (!part) return;
    if (
      (part.startsWith("'") && part.endsWith("'") && part.length >= 2) ||
      (part.startsWith('"') && part.endsWith('"') && part.length >= 2)
    ) {
      out.push(
        <span key={`${keyPrefix}-${i}`} className="text-emerald-400">
          {part}
        </span>,
      );
    } else if (/^\d+$/.test(part) || part === "true" || part === "false" || part === "null") {
      out.push(
        <span key={`${keyPrefix}-${i}`} className="text-amber-300">
          {part}
        </span>,
      );
    } else {
      out.push(
        <span key={`${keyPrefix}-${i}`}>{part}</span>,
      );
    }
  });
  return out;
}

function splitComment(text: string): [string, string] {
  let quote: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (ch === "#" && (i === 0 || text[i - 1] === " ")) {
      return [text.slice(0, i), text.slice(i)];
    }
  }
  return [text, ""];
}

const YAML_KEY_RE = /^(\s*(?:-\s+)?)([A-Za-z][A-Za-z0-9_/-]*:)(.*)$/;

function renderLine(line: string, language: CodeLanguage): ReactNode {
  if (line.trimStart().startsWith("#")) {
    return <span className="italic text-zinc-500">{line}</span>;
  }
  const [code, comment] = splitComment(line);
  const nodes: ReactNode[] = [];
  if (language === "yaml") {
    const match = code.match(YAML_KEY_RE);
    if (match) {
      nodes.push(<span key="indent">{match[1]}</span>);
      nodes.push(
        <span key="key" className="text-rose-400">
          {match[2]}
        </span>,
      );
      nodes.push(...renderSegment(match[3] ?? "", "seg"));
    } else {
      nodes.push(...renderSegment(code, "seg"));
    }
  } else {
    nodes.push(...renderSegment(code, "seg"));
  }
  if (comment) {
    nodes.push(
      <span key="comment" className="italic text-zinc-500">
        {comment}
      </span>,
    );
  }
  return <>{nodes}</>;
}

export function CodeView({ code, language }: { code: string; language: CodeLanguage }) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-zinc-200">
      <code>
        {lines.map((line, i) => (
          <Fragment key={i}>
            {line === "" ? "\u00A0" : renderLine(line, language)}
            {"\n"}
          </Fragment>
        ))}
      </code>
    </pre>
  );
}
