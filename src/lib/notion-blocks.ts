export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bullet"
  | "numbered"
  | "table"

export type EditorBlock = {
  id: string
  type: BlockType
  content: string
  rows?: string[][]
}

export function createBlockId() {
  return `block-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

export function createEmptyBlock(type: BlockType = "paragraph"): EditorBlock {
  if (type === "table") {
    return {
      id: createBlockId(),
      type,
      content: "",
      rows: [
        ["", ""],
        ["", ""],
      ],
    }
  }

  return {
    id: createBlockId(),
    type,
    content: "",
  }
}

function parseTableLines(lines: string[]): string[][] {
  return lines
    .filter((line) => !/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(line))
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim())
    )
    .filter((row) => row.some((cell) => cell.length > 0) || row.length > 0)
}

export function markdownToBlocks(markdown: string): EditorBlock[] {
  const source = markdown.replace(/\r\n/g, "\n").trim()

  if (!source) {
    return [createEmptyBlock("paragraph")]
  }

  const lines = source.split("\n")
  const blocks: EditorBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (/^\s*\|/.test(line)) {
      const tableLines: string[] = []
      while (index < lines.length && /^\s*\|/.test(lines[index])) {
        tableLines.push(lines[index])
        index += 1
      }

      const rows = parseTableLines(tableLines)
      blocks.push({
        id: createBlockId(),
        type: "table",
        content: "",
        rows: rows.length > 0 ? rows : [["", ""]],
      })
      continue
    }

    if (line.trim() === "") {
      index += 1
      continue
    }

    if (line.startsWith("### ")) {
      blocks.push({
        id: createBlockId(),
        type: "heading3",
        content: line.slice(4),
      })
    } else if (line.startsWith("## ")) {
      blocks.push({
        id: createBlockId(),
        type: "heading2",
        content: line.slice(3),
      })
    } else if (line.startsWith("# ")) {
      blocks.push({
        id: createBlockId(),
        type: "heading1",
        content: line.slice(2),
      })
    } else if (/^\s*[-*]\s+/.test(line)) {
      blocks.push({
        id: createBlockId(),
        type: "bullet",
        content: line.replace(/^\s*[-*]\s+/, ""),
      })
    } else if (/^\s*\d+\.\s+/.test(line)) {
      blocks.push({
        id: createBlockId(),
        type: "numbered",
        content: line.replace(/^\s*\d+\.\s+/, ""),
      })
    } else {
      blocks.push({
        id: createBlockId(),
        type: "paragraph",
        content: line,
      })
    }

    index += 1
  }

  return blocks.length > 0 ? blocks : [createEmptyBlock("paragraph")]
}

export function blocksToMarkdown(blocks: EditorBlock[]): string {
  const parts: string[] = []

  for (const block of blocks) {
    switch (block.type) {
      case "heading1":
        parts.push(`# ${block.content}`)
        break
      case "heading2":
        parts.push(`## ${block.content}`)
        break
      case "heading3":
        parts.push(`### ${block.content}`)
        break
      case "bullet":
        parts.push(`- ${block.content}`)
        break
      case "numbered":
        parts.push(`1. ${block.content}`)
        break
      case "table": {
        const rows = block.rows ?? [["", ""]]
        const columnCount = Math.max(...rows.map((row) => row.length), 1)
        const normalized = rows.map((row) => {
          const next = [...row]
          while (next.length < columnCount) {
            next.push("")
          }
          return next
        })
        const header = normalized[0] ?? Array.from({ length: columnCount }, () => "")
        const separator = Array.from({ length: columnCount }, () => "---")
        const body = normalized.slice(1)
        parts.push(
          [
            `| ${header.join(" | ")} |`,
            `| ${separator.join(" | ")} |`,
            ...body.map((row) => `| ${row.join(" | ")} |`),
          ].join("\n")
        )
        break
      }
      default:
        parts.push(block.content)
        break
    }
  }

  return parts.join("\n\n")
}

export const BLOCK_MENU_OPTIONS: {
  type: BlockType
  label: string
  description: string
}[] = [
  {
    type: "paragraph",
    label: "Texto",
    description: "Paragrafo simples",
  },
  {
    type: "heading1",
    label: "Titulo 1",
    description: "Titulo grande",
  },
  {
    type: "heading2",
    label: "Titulo 2",
    description: "Titulo medio",
  },
  {
    type: "heading3",
    label: "Titulo 3",
    description: "Titulo pequeno",
  },
  {
    type: "bullet",
    label: "Lista com marcadores",
    description: "Lista com bullets",
  },
  {
    type: "numbered",
    label: "Lista numerada",
    description: "Lista ordenada",
  },
  {
    type: "table",
    label: "Tabela",
    description: "Tabela simples",
  },
]
