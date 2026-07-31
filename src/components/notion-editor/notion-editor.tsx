"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MutableRefObject,
} from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVerticalIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PlusIcon,
  TableIcon,
  Trash2Icon,
  TypeIcon,
} from "lucide-react"

import {
  BLOCK_MENU_OPTIONS,
  blocksToMarkdown,
  createEmptyBlock,
  markdownToBlocks,
  type BlockType,
  type EditorBlock,
} from "@/lib/notion-blocks"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type NotionEditorProps = {
  value: string
  onChange: (markdown: string) => void
  className?: string
}

type MenuPosition = {
  top: number
  left: number
  openUp: boolean
}

type SlashMenuState = {
  blockId: string
  query: string
} & MenuPosition | null

function getMenuPosition(rect: DOMRect): MenuPosition {
  const menuHeight = 280
  const spaceBelow = window.innerHeight - rect.bottom
  const openUp = spaceBelow < menuHeight
  const left = Math.min(rect.left, window.innerWidth - 272)

  if (openUp) {
    return {
      top: Math.max(8, rect.top - 4),
      left: Math.max(8, left),
      openUp: true,
    }
  }

  return {
    top: rect.bottom + 4,
    left: Math.max(8, left),
    openUp: false,
  }
}

const BLOCK_ICONS: Record<BlockType, typeof TypeIcon> = {
  paragraph: TypeIcon,
  heading1: Heading1Icon,
  heading2: Heading2Icon,
  heading3: Heading3Icon,
  bullet: ListIcon,
  numbered: ListOrderedIcon,
  table: TableIcon,
}

function getPlaceholder(type: BlockType) {
  switch (type) {
    case "heading1":
      return "Titulo 1"
    case "heading2":
      return "Titulo 2"
    case "heading3":
      return "Titulo 3"
    case "bullet":
    case "numbered":
      return "Item da lista"
    default:
      return "Digite / para comandos"
  }
}

function EditableTable({
  blockId,
  rows,
  onCellChange,
  onAddRow,
  onAddColumn,
  onRemoveRow,
  onRemoveColumn,
  onDeleteTable,
  onExitBelow,
  onFocus,
}: {
  blockId: string
  rows: string[][]
  onCellChange: (blockId: string, rowIndex: number, cellIndex: number, value: string) => void
  onAddRow: (blockId: string) => void
  onAddColumn: (blockId: string) => void
  onRemoveRow: (blockId: string, rowIndex: number) => void
  onRemoveColumn: (blockId: string, columnIndex: number) => void
  onDeleteTable: (blockId: string) => void
  onExitBelow: (blockId: string) => void
  onFocus: (blockId: string) => void
}) {
  const columnCount = Math.max(...rows.map((row) => row.length), 1)
  const normalizedRows = rows.map((row) => {
    const next = [...row]
    while (next.length < columnCount) {
      next.push("")
    }
    return next.slice(0, columnCount)
  })

  return (
    <div className="group/table relative w-fit max-w-full py-1 pr-10 pb-10">
      <div className="mb-1 flex items-center justify-end opacity-0 transition-opacity group-hover/table:opacity-100 group-focus-within/table:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground"
          onClick={() => onDeleteTable(blockId)}
          title="Remover tabela"
        >
          <Trash2Icon />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-max border-collapse table-fixed text-sm">
          <colgroup>
            {Array.from({ length: columnCount }).map((_, columnIndex) => (
              <col key={`${blockId}-col-${columnIndex}`} className="w-28" />
            ))}
            <col className="w-8" />
          </colgroup>
          <thead>
            <tr>
              {Array.from({ length: columnCount }).map((_, columnIndex) => (
                <th
                  key={`${blockId}-col-action-${columnIndex}`}
                  className="h-7 p-0 text-center font-normal"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground opacity-0 transition-opacity group-hover/table:opacity-100 group-focus-within/table:opacity-100"
                    onClick={() => onRemoveColumn(blockId, columnIndex)}
                    title="Remover coluna"
                  >
                    <MinusIcon />
                  </Button>
                </th>
              ))}
              <th className="p-0" />
            </tr>
          </thead>
          <tbody>
            {normalizedRows.map((row, rowIndex) => (
              <tr key={`${blockId}-row-${rowIndex}`} className="group/row">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${blockId}-cell-${rowIndex}-${cellIndex}`}
                    className="border border-border/60 p-0"
                  >
                    <input
                      value={cell}
                      onFocus={() => onFocus(blockId)}
                      onChange={(event) =>
                        onCellChange(blockId, rowIndex, cellIndex, event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          if (rowIndex >= normalizedRows.length - 1) {
                            onExitBelow(blockId)
                            return
                          }

                          const next = event.currentTarget
                            .closest("tbody")
                            ?.querySelector<HTMLInputElement>(
                              `tr:nth-child(${rowIndex + 2}) td:nth-child(${cellIndex + 1}) input`
                            )
                          next?.focus()
                          return
                        }

                        if (event.key === "ArrowDown" && rowIndex >= normalizedRows.length - 1) {
                          event.preventDefault()
                          onExitBelow(blockId)
                        }
                      }}
                      className="w-full bg-transparent px-2 py-1.5 outline-none"
                    />
                  </td>
                ))}
                <td className="border-0 p-0 align-middle">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100 group-hover/table:opacity-100 group-focus-within/table:opacity-100"
                    onClick={() => onRemoveRow(blockId, rowIndex)}
                    title="Remover linha"
                  >
                    <MinusIcon />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute top-8 right-0 text-muted-foreground opacity-0 transition-opacity group-hover/table:opacity-100 group-focus-within/table:opacity-100"
        onClick={() => onAddColumn(blockId)}
        title="Adicionar coluna"
      >
        <PlusIcon />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute bottom-0 left-0 text-muted-foreground opacity-0 transition-opacity group-hover/table:opacity-100 group-focus-within/table:opacity-100"
        onClick={() => onAddRow(blockId)}
        title="Adicionar linha"
      >
        <PlusIcon />
      </Button>
    </div>
  )
}

function SortableBlock({
  block,
  index,
  numberedIndex,
  focusedBlockId,
  onContentChange,
  onKeyDown,
  onOpenMenu,
  onFocus,
  onBlur,
  onTableCellChange,
  onAddTableRow,
  onAddTableColumn,
  onRemoveTableRow,
  onRemoveTableColumn,
  onDeleteBlock,
  onExitTableBelow,
  inputRefs,
}: {
  block: EditorBlock
  index: number
  numberedIndex: number
  focusedBlockId: string | null
  onContentChange: (id: string, content: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>, id: string) => void
  onOpenMenu: (id: string, rect: DOMRect) => void
  onFocus: (id: string) => void
  onBlur: (id: string) => void
  onTableCellChange: (id: string, rowIndex: number, cellIndex: number, value: string) => void
  onAddTableRow: (id: string) => void
  onAddTableColumn: (id: string) => void
  onRemoveTableRow: (id: string, rowIndex: number) => void
  onRemoveTableColumn: (id: string, columnIndex: number) => void
  onDeleteBlock: (id: string) => void
  onExitTableBelow: (id: string) => void
  inputRefs: MutableRefObject<Record<string, HTMLTextAreaElement | null>>
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isFocused = focusedBlockId === block.id
  const showPlaceholder = isFocused && block.content.length === 0

  const textareaRef = (node: HTMLTextAreaElement | null) => {
    inputRefs.current[block.id] = node
  }

  useEffect(() => {
    const node = inputRefs.current[block.id]
    if (!node || block.type === "table") {
      return
    }

    node.style.height = "auto"
    node.style.height = `${Math.max(node.scrollHeight, 28)}px`
  }, [block.content, block.id, block.type, inputRefs])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-start gap-1 py-0.5",
        isDragging && "opacity-60"
      )}
    >
      <div className="flex w-16 shrink-0 items-center justify-end gap-0.5 pt-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="cursor-grab text-muted-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            onOpenMenu(block.id, rect)
          }}
        >
          <PlusIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground"
          onClick={() => onDeleteBlock(block.id)}
          title="Apagar bloco"
        >
          <Trash2Icon />
        </Button>
      </div>

      <div className="min-w-0 flex-1">
        {block.type === "table" ? (
          <EditableTable
            blockId={block.id}
            rows={block.rows ?? [["", ""]]}
            onCellChange={onTableCellChange}
            onAddRow={onAddTableRow}
            onAddColumn={onAddTableColumn}
            onRemoveRow={onRemoveTableRow}
            onRemoveColumn={onRemoveTableColumn}
            onDeleteTable={onDeleteBlock}
            onExitBelow={onExitTableBelow}
            onFocus={onFocus}
          />
        ) : (
          <div className="flex items-start gap-2">
            {block.type === "bullet" ? (
              <span className="mt-2 text-sm text-muted-foreground">•</span>
            ) : null}
            {block.type === "numbered" ? (
              <span className="mt-2 w-4 shrink-0 text-sm text-muted-foreground">
                {numberedIndex}.
              </span>
            ) : null}
            <textarea
              ref={textareaRef}
              value={block.content}
              rows={1}
              placeholder={showPlaceholder ? getPlaceholder(block.type) : undefined}
              onFocus={() => onFocus(block.id)}
              onBlur={() => onBlur(block.id)}
              onChange={(event) => onContentChange(block.id, event.target.value)}
              onKeyDown={(event) => onKeyDown(event, block.id)}
              className={cn(
                "w-full resize-none bg-transparent py-1 outline-none placeholder:text-muted-foreground/50",
                block.type === "heading1" && "text-3xl font-semibold tracking-tight",
                block.type === "heading2" && "text-2xl font-semibold tracking-tight",
                block.type === "heading3" && "text-xl font-medium tracking-tight",
                (block.type === "paragraph" ||
                  block.type === "bullet" ||
                  block.type === "numbered") &&
                  "text-base leading-7"
              )}
            />
          </div>
        )}
      </div>
      <span className="sr-only">Bloco {index + 1}</span>
    </div>
  )
}

export function NotionEditor({ value, onChange, className }: NotionEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => markdownToBlocks(value))
  const [slashMenu, setSlashMenu] = useState<SlashMenuState>(null)
  const [plusMenu, setPlusMenu] = useState<
    ({ blockId: string } & MenuPosition) | null
  >(null)
  const [menuIndex, setMenuIndex] = useState(0)
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const menuOptionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const skipNextSync = useRef(false)
  const blocksRef = useRef(blocks)
  const lastEnterRef = useRef<{
    time: number
    blockId: string
    createdBlockId: string
    type: BlockType
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    blocksRef.current = blocks
  }, [blocks])

  useEffect(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }

    // Evita recriar blocos (e IDs) quando o markdown ja representa o estado atual.
    if (blocksToMarkdown(blocksRef.current) === value) {
      return
    }

    setBlocks(markdownToBlocks(value))
  }, [value])

  function emitChange(nextBlocks: EditorBlock[]) {
    const markdown = blocksToMarkdown(nextBlocks)
    blocksRef.current = nextBlocks
    setBlocks(nextBlocks)
    skipNextSync.current = true
    onChange(markdown)
  }

  function focusBlock(blockId: string, cursorAtEnd = true) {
    requestAnimationFrame(() => {
      const node = inputRefs.current[blockId]
      if (!node) {
        return
      }

      node.focus()
      setFocusedBlockId(blockId)
      if (cursorAtEnd) {
        const length = node.value.length
        node.setSelectionRange(length, length)
      }
    })
  }

  function updateBlockContent(blockId: string, content: string) {
    const nextBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, content } : block
    )

    const current = nextBlocks.find((block) => block.id === blockId)
    if (current && content.startsWith("/")) {
      const node = inputRefs.current[blockId]
      const rect = node?.getBoundingClientRect()
      setSlashMenu({
        blockId,
        query: content.slice(1),
        ...(rect
          ? getMenuPosition(rect)
          : { top: 0, left: 0, openUp: true }),
      })
      setPlusMenu(null)
    } else if (slashMenu?.blockId === blockId) {
      setSlashMenu(null)
    }

    emitChange(nextBlocks)
  }

  function updateTableCell(
    blockId: string,
    rowIndex: number,
    cellIndex: number,
    cellValue: string
  ) {
    const nextBlocks = blocks.map((block) => {
      if (block.id !== blockId || !block.rows) {
        return block
      }

      const rows = block.rows.map((row, currentRow) =>
        currentRow === rowIndex
          ? row.map((cell, currentCell) =>
              currentCell === cellIndex ? cellValue : cell
            )
          : row
      )

      return { ...block, rows }
    })

    emitChange(nextBlocks)
  }

  function addTableRow(blockId: string) {
    const nextBlocks = blocks.map((block) => {
      if (block.id !== blockId || !block.rows) {
        return block
      }

      const columnCount = Math.max(...block.rows.map((row) => row.length), 1)
      return {
        ...block,
        rows: [...block.rows, Array.from({ length: columnCount }, () => "")],
      }
    })

    emitChange(nextBlocks)
  }

  function addTableColumn(blockId: string) {
    const nextBlocks = blocks.map((block) => {
      if (block.id !== blockId || !block.rows) {
        return block
      }

      return {
        ...block,
        rows: block.rows.map((row) => [...row, ""]),
      }
    })

    emitChange(nextBlocks)
  }

  function deleteBlock(blockId: string) {
    const index = blocks.findIndex((block) => block.id === blockId)
    if (index < 0) {
      return
    }

    if (blocks.length === 1) {
      const empty = createEmptyBlock("paragraph")
      emitChange([empty])
      focusBlock(empty.id)
      return
    }

    const nextBlocks = blocks.filter((block) => block.id !== blockId)
    const focusTarget = nextBlocks[Math.min(index, nextBlocks.length - 1)]
    emitChange(nextBlocks)
    if (focusTarget && focusTarget.type !== "table") {
      focusBlock(focusTarget.id)
    }
  }

  function removeTableRow(blockId: string, rowIndex: number) {
    const block = blocks.find((item) => item.id === blockId)
    if (!block?.rows) {
      return
    }

    if (block.rows.length <= 1) {
      deleteBlock(blockId)
      return
    }

    const nextBlocks = blocks.map((item) => {
      if (item.id !== blockId || !item.rows) {
        return item
      }

      return {
        ...item,
        rows: item.rows.filter((_, index) => index !== rowIndex),
      }
    })

    emitChange(nextBlocks)
  }

  function removeTableColumn(blockId: string, columnIndex: number) {
    const block = blocks.find((item) => item.id === blockId)
    if (!block?.rows) {
      return
    }

    const columnCount = Math.max(...block.rows.map((row) => row.length), 1)
    if (columnCount <= 1) {
      deleteBlock(blockId)
      return
    }

    const nextBlocks = blocks.map((item) => {
      if (item.id !== blockId || !item.rows) {
        return item
      }

      return {
        ...item,
        rows: item.rows.map((row) => row.filter((_, index) => index !== columnIndex)),
      }
    })

    emitChange(nextBlocks)
  }

  function insertBlockAfter(blockId: string, type: BlockType = "paragraph") {
    const currentBlocks = blocksRef.current
    const index = currentBlocks.findIndex((block) => block.id === blockId)
    if (index < 0) {
      return null
    }

    const newBlock = createEmptyBlock(type)
    const needsTrailingParagraph =
      type === "table" ||
      type === "bullet" ||
      type === "numbered" ||
      type === "heading1" ||
      type === "heading2" ||
      type === "heading3"

    const hasBlockAfter = Boolean(currentBlocks[index + 1])
    const trailing =
      needsTrailingParagraph && !hasBlockAfter
        ? [newBlock, createEmptyBlock("paragraph")]
        : [newBlock]

    const nextBlocks = [
      ...currentBlocks.slice(0, index + 1),
      ...trailing,
      ...currentBlocks.slice(index + 1),
    ]
    emitChange(nextBlocks)
    focusBlock(newBlock.id)
    return newBlock
  }

  function exitTableBelow(blockId: string) {
    const index = blocks.findIndex((block) => block.id === blockId)
    if (index < 0) {
      return
    }

    const next = blocks[index + 1]
    if (next && next.type !== "table") {
      focusBlock(next.id)
      return
    }

    insertBlockAfter(blockId, "paragraph")
  }

  function convertBlock(blockId: string, type: BlockType, clearSlash = false) {
    const index = blocks.findIndex((block) => block.id === blockId)
    let nextBlocks = blocks.map((block) => {
      if (block.id !== blockId) {
        return block
      }

      if (type === "table") {
        return {
          ...createEmptyBlock("table"),
          id: block.id,
        }
      }

      return {
        ...block,
        type,
        content: clearSlash ? "" : block.content.replace(/^\/[^\n]*/, ""),
        rows: undefined,
      }
    })

    const needsTrailingParagraph =
      type === "table" ||
      type === "bullet" ||
      type === "numbered" ||
      type === "heading1" ||
      type === "heading2" ||
      type === "heading3"

    if (needsTrailingParagraph && index >= 0 && !nextBlocks[index + 1]) {
      nextBlocks = [
        ...nextBlocks.slice(0, index + 1),
        createEmptyBlock("paragraph"),
        ...nextBlocks.slice(index + 1),
      ]
    }

    setSlashMenu(null)
    setPlusMenu(null)
    emitChange(nextBlocks)
    focusBlock(blockId)
  }

  function turnIntoParagraph(blockId: string) {
    const nextBlocks = blocksRef.current.map((block) =>
      block.id === blockId
        ? {
            ...block,
            type: "paragraph" as const,
            content: "",
            rows: undefined,
          }
        : block
    )
    emitChange(nextBlocks)
    focusBlock(blockId)
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
    blockId: string
  ) {
    const block = blocksRef.current.find((item) => item.id === blockId)
    if (!block) {
      return
    }

    if (slashMenu) {
      const optionCount = filteredSlashOptions.length

      if (event.key === "ArrowDown") {
        event.preventDefault()
        if (optionCount === 0) {
          return
        }
        setMenuIndex((atual) => (atual + 1) % optionCount)
        return
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        if (optionCount === 0) {
          return
        }
        setMenuIndex((atual) => (atual - 1 + optionCount) % optionCount)
        return
      }

      if (event.key === "Escape") {
        event.preventDefault()
        setSlashMenu(null)
        return
      }

      if (event.key === "Enter") {
        const selected = filteredSlashOptions[menuIndex] ?? filteredSlashOptions[0]
        if (selected) {
          event.preventDefault()
          convertBlock(blockId, selected.type, true)
        }
        return
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()

      const now = Date.now()
      const isList = block.type === "bullet" || block.type === "numbered"
      const isHeading =
        block.type === "heading1" ||
        block.type === "heading2" ||
        block.type === "heading3"
      const lastEnter = lastEnterRef.current
      const isDoubleEnter =
        Boolean(lastEnter) &&
        now - (lastEnter?.time ?? 0) < 450 &&
        (lastEnter?.createdBlockId === blockId || lastEnter?.blockId === blockId)

      // Item vazio: sai da lista/titulo
      if ((isList || isHeading) && block.content.trim() === "") {
        turnIntoParagraph(blockId)
        lastEnterRef.current = null
        return
      }

      // 2 Enter rapidos: sai da lista/titulo
      if ((isList || isHeading) && isDoubleEnter && lastEnter) {
        const created = blocksRef.current.find(
          (item) => item.id === lastEnter.createdBlockId
        )

        if (created && created.content.trim() === "") {
          turnIntoParagraph(created.id)
        } else {
          insertBlockAfter(blockId, "paragraph")
        }

        lastEnterRef.current = null
        return
      }

      if (isHeading || block.type === "paragraph" || block.type === "table") {
        insertBlockAfter(blockId, "paragraph")
        lastEnterRef.current = null
        return
      }

      const created = insertBlockAfter(blockId, block.type)
      lastEnterRef.current = created
        ? {
            time: now,
            blockId,
            createdBlockId: created.id,
            type: block.type,
          }
        : null
      return
    }

    if (event.key === "Backspace" && block.content === "" && blocksRef.current.length > 1) {
      event.preventDefault()
      const index = blocksRef.current.findIndex((item) => item.id === blockId)
      const isList = block.type === "bullet" || block.type === "numbered"
      const isHeading =
        block.type === "heading1" ||
        block.type === "heading2" ||
        block.type === "heading3"

      if (isList || isHeading) {
        turnIntoParagraph(blockId)
        return
      }

      const nextBlocks = blocksRef.current.filter((item) => item.id !== blockId)
      const previous = nextBlocks[Math.max(0, index - 1)]
      emitChange(nextBlocks)
      if (previous) {
        focusBlock(previous.id)
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = blocks.findIndex((block) => block.id === active.id)
    const newIndex = blocks.findIndex((block) => block.id === over.id)
    if (oldIndex < 0 || newIndex < 0) {
      return
    }

    emitChange(arrayMove(blocks, oldIndex, newIndex))
  }

  const filteredSlashOptions = useMemo(() => {
    if (!slashMenu) {
      return BLOCK_MENU_OPTIONS
    }

    const query = slashMenu.query.trim().toLowerCase()
    if (!query) {
      return BLOCK_MENU_OPTIONS
    }

    return BLOCK_MENU_OPTIONS.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.description.toLowerCase().includes(query) ||
        option.type.includes(query)
    )
  }, [slashMenu])

  const numberedCounters = useMemo(() => {
    let counter = 0
    return blocks.map((block) => {
      if (block.type !== "numbered") {
        counter = 0
        return 0
      }

      counter += 1
      return counter
    })
  }, [blocks])

  const menuOptions = plusMenu ? BLOCK_MENU_OPTIONS : filteredSlashOptions
  const activeMenu = plusMenu
    ? {
        top: plusMenu.top,
        left: plusMenu.left,
        openUp: plusMenu.openUp,
        blockId: plusMenu.blockId,
        mode: "plus" as const,
      }
    : slashMenu
      ? {
          top: slashMenu.top,
          left: slashMenu.left,
          openUp: slashMenu.openUp,
          blockId: slashMenu.blockId,
          mode: "slash" as const,
        }
      : null

  useEffect(() => {
    setMenuIndex(0)
  }, [slashMenu?.blockId, slashMenu?.query, plusMenu?.blockId])

  useEffect(() => {
    if (menuOptions.length === 0) {
      return
    }

    setMenuIndex((atual) => Math.min(atual, menuOptions.length - 1))
  }, [menuOptions.length])

  useEffect(() => {
    menuOptionRefs.current[menuIndex]?.scrollIntoView({ block: "nearest" })
  }, [menuIndex])

  return (
    <div className={cn("relative w-full", className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((block) => block.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col">
            {blocks.map((block, index) => (
              <SortableBlock
                key={block.id}
                block={block}
                index={index}
                numberedIndex={numberedCounters[index]}
                focusedBlockId={focusedBlockId}
                onContentChange={updateBlockContent}
                onKeyDown={handleKeyDown}
                onOpenMenu={(id, rect) => {
                  setPlusMenu({
                    blockId: id,
                    ...getMenuPosition(rect),
                  })
                  setSlashMenu(null)
                }}
                onFocus={setFocusedBlockId}
                onBlur={(id) => {
                  setFocusedBlockId((atual) => (atual === id ? null : atual))
                }}
                onTableCellChange={updateTableCell}
                onAddTableRow={addTableRow}
                onAddTableColumn={addTableColumn}
                onRemoveTableRow={removeTableRow}
                onRemoveTableColumn={removeTableColumn}
                onDeleteBlock={deleteBlock}
                onExitTableBelow={exitTableBelow}
                inputRefs={inputRefs}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {(slashMenu || plusMenu) && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => {
            setSlashMenu(null)
            setPlusMenu(null)
          }}
        />
      )}

      {activeMenu ? (
        <div
          className="fixed z-50 w-64 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
          style={{
            top: activeMenu.top,
            left: activeMenu.left,
            transform: activeMenu.openUp ? "translateY(-100%)" : undefined,
          }}
        >
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            {activeMenu.mode === "slash" ? "Blocos" : "Inserir bloco"}
          </p>
          <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
            {menuOptions.map((option, index) => {
              const Icon = BLOCK_ICONS[option.type]
              const selected = index === menuIndex
              return (
                <button
                  key={option.type}
                  ref={(node) => {
                    menuOptionRefs.current[index] = node
                  }}
                  type="button"
                  className={cn(
                    "flex items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted",
                    selected && "bg-muted"
                  )}
                  onMouseEnter={() => setMenuIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    if (activeMenu.mode === "plus") {
                      insertBlockAfter(activeMenu.blockId, option.type)
                      setPlusMenu(null)
                      return
                    }

                    convertBlock(activeMenu.blockId, option.type, true)
                  }}
                >
                  <Icon className="mt-0.5 size-4 text-muted-foreground" />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </button>
              )
            })}
            {menuOptions.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                Nenhum bloco encontrado
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
