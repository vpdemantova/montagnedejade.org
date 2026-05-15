/**
 * blocknote-md.ts — conversor bidirecional entre BlockNote JSON e Markdown.
 *
 * BlockNote → Markdown: usado ao escrever arquivos .md (sync:down / writeMirror em Workspace)
 * Markdown → BlockNote: usado ao importar arquivos .md de volta ao editor (sync:up para Page)
 *
 * Suporte: parágrafos, headings (h1-h3), listas, blockquotes, código inline/block,
 * bold, italic, links. Recursos avançados do BlockNote (tabelas, colunas, embeds)
 * são convertidos para texto simples.
 */

// ── Tipos internos do BlockNote ───────────────────────────────────────────────

type BNInline = {
  type:   "text" | "link"
  text?:  string
  href?:  string
  content?: BNInline[]
  styles?: {
    bold?:          boolean
    italic?:        boolean
    underline?:     boolean
    strikethrough?: boolean
    code?:          boolean
  }
}

type BNBlock = {
  type:    string
  props?:  Record<string, unknown>
  content?: BNInline[]
  children?: BNBlock[]
}

// ── BlockNote → Markdown ──────────────────────────────────────────────────────

function inlineToMd(inline: BNInline[]): string {
  return inline.map((s) => {
    if (s.type === "link") {
      const text = s.content ? inlineToMd(s.content) : s.href ?? ""
      return `[${text}](${s.href ?? ""})`
    }
    let text = s.text ?? ""
    if (s.styles?.code)          text = `\`${text}\``
    if (s.styles?.bold)          text = `**${text}**`
    if (s.styles?.italic)        text = `_${text}_`
    if (s.styles?.strikethrough) text = `~~${text}~~`
    return text
  }).join("")
}

function blockToMd(block: BNBlock, depth = 0): string {
  const indent  = "  ".repeat(depth)
  const content = block.content ? inlineToMd(block.content) : ""
  const childrenMd = (block.children ?? []).map((c) => blockToMd(c, depth + 1)).join("\n")

  let line = ""
  switch (block.type) {
    case "heading": {
      const level = (block.props?.level as number) ?? 2
      line = `${"#".repeat(level)} ${content}`
      break
    }
    case "bulletListItem":
      line = `${indent}- ${content}`
      break
    case "numberedListItem":
      line = `${indent}1. ${content}`
      break
    case "checkListItem":
      line = `${indent}- [${block.props?.checked ? "x" : " "}] ${content}`
      break
    case "quote":
      line = `> ${content}`
      break
    case "code":
      line = `\`\`\`\n${content}\n\`\`\``
      break
    case "image":
      line = `![${block.props?.caption ?? ""}](${block.props?.url ?? ""})`
      break
    case "paragraph":
    default:
      line = content
      break
  }

  return [line, childrenMd].filter(Boolean).join("\n")
}

/**
 * Converte BlockNote JSON (string serializada) para Markdown.
 * Se o input já for Markdown simples (não JSON), retorna como está.
 */
export function blockNoteToMarkdown(raw: string | null | undefined): string {
  if (!raw) return ""

  // Se não parecer JSON, é markdown puro — retorna direto
  const trimmed = raw.trim()
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return trimmed

  try {
    const blocks = JSON.parse(trimmed) as BNBlock[]
    return blocks.map((b) => blockToMd(b)).filter(Boolean).join("\n\n")
  } catch {
    return trimmed
  }
}

// ── Markdown → BlockNote ──────────────────────────────────────────────────────

function makeParagraph(text: string): BNBlock {
  return {
    type:    "paragraph",
    content: text ? [{ type: "text", text, styles: {} }] : [],
  }
}

function parseInline(text: string): BNInline[] {
  // Regex simples para bold, italic, inline code, links
  const tokens: BNInline[] = []
  const re = /(\*\*(.+?)\*\*|_(.+?)_|`(.+?)`|\[(.+?)\]\((.+?)\))/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", text: text.slice(last, match.index), styles: {} })
    }

    if (match[2] !== undefined) {
      tokens.push({ type: "text", text: match[2], styles: { bold: true } })
    } else if (match[3] !== undefined) {
      tokens.push({ type: "text", text: match[3], styles: { italic: true } })
    } else if (match[4] !== undefined) {
      tokens.push({ type: "text", text: match[4], styles: { code: true } })
    } else if (match[5] !== undefined && match[6] !== undefined) {
      tokens.push({ type: "link", href: match[6], content: [{ type: "text", text: match[5], styles: {} }] })
    }

    last = match.index + match[0].length
  }

  if (last < text.length) {
    tokens.push({ type: "text", text: text.slice(last), styles: {} })
  }

  return tokens.length > 0 ? tokens : [{ type: "text", text, styles: {} }]
}

/**
 * Converte Markdown para BlockNote JSON (string serializada).
 * Suporte básico: headings, listas, blockquote, parágrafos, code blocks.
 */
export function markdownToBlockNote(md: string): string {
  if (!md.trim()) return "[]"

  const lines  = md.split("\n")
  const blocks: BNBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i] ?? ""

    // Heading
    const hMatch = /^(#{1,6})\s+(.+)/.exec(line)
    if (hMatch) {
      blocks.push({
        type:    "heading",
        props:   { level: (hMatch[1] ?? "").length, textColor: "default", backgroundColor: "default", textAlignment: "left" },
        content: parseInline(hMatch[2] ?? ""),
      })
      i++
      continue
    }

    // Fenced code block
    if (line.startsWith("```")) {
      i++
      const codeLines: string[] = []
      while (i < lines.length && !lines[i]?.startsWith("```")) {
        codeLines.push(lines[i] ?? "")
        i++
      }
      i++ // skip closing ```
      blocks.push({
        type:    "code",
        content: [{ type: "text", text: codeLines.join("\n"), styles: {} }],
      })
      continue
    }

    // Blockquote
    if (line.startsWith("> ")) {
      blocks.push({
        type:    "quote",
        content: parseInline(line.slice(2)),
      })
      i++
      continue
    }

    // Bullet list
    const bulletMatch = /^(\s*)[-*]\s+(.+)/.exec(line)
    if (bulletMatch) {
      blocks.push({
        type:    "bulletListItem",
        content: parseInline(bulletMatch[2] ?? ""),
      })
      i++
      continue
    }

    // Numbered list
    const numMatch = /^(\s*)\d+\.\s+(.+)/.exec(line)
    if (numMatch) {
      blocks.push({
        type:    "numberedListItem",
        content: parseInline(numMatch[2] ?? ""),
      })
      i++
      continue
    }

    // Empty line → skip
    if (!line.trim()) {
      i++
      continue
    }

    // Paragraph
    blocks.push({
      type:    "paragraph",
      content: parseInline(line),
      props:   { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    })
    i++
  }

  // Garantir pelo menos um bloco
  if (blocks.length === 0) blocks.push(makeParagraph(""))

  return JSON.stringify(blocks)
}

/**
 * Extrai texto simples de BlockNote JSON ou Markdown para snippets/excerpts.
 */
export function extractPlainText(raw: string | null | undefined): string {
  if (!raw) return ""
  const md = blockNoteToMarkdown(raw)
  return md.replace(/#{1,6}\s+/g, "").replace(/[*_`~>]/g, "").trim()
}
