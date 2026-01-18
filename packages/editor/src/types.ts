/**
 * @inkdown/editor - TypeScript Type Definitions
 *
 * These types provide a backward-compatible interface for the new @muyajs/core
 * while maintaining the API surface that the Vue components expect.
 */

// Re-export core types from @muyajs/core
export type { TState } from '@muyajs/core'

// Note: IMuyaOptions is not exported from the main package, so we define it locally
// This matches the @muyajs/core internal type
export interface IMuyaOptions {
  fontSize: number
  lineHeight: number
  focusMode: boolean
  trimUnnecessaryCodeBlockEmptyLines: boolean
  preferLooseListItem: boolean
  autoPairBracket: boolean
  autoPairMarkdownSyntax: boolean
  autoPairQuote: boolean
  bulletListMarker: string
  orderListDelimiter: string
  tabSize: number
  codeBlockLineNumbers: boolean
  listIndentation: number
  frontMatter: boolean
  frontmatterType: string
  mermaidTheme: string
  vegaTheme: string
  hideQuickInsertHint: boolean
  hideLinkPopup: boolean
  autoCheck: boolean
  spellcheckEnabled: boolean
  superSubScript: boolean
  footnote: boolean
  math: boolean
  isGitlabCompatibilityEnabled: boolean
  autoMoveCheckedToEnd: boolean
  disableHtml: boolean
  locale: {
    name: string
    resource: Record<string, string>
  }
  json?: any[]
  markdown?: string
}

/**
 * Editor initialization options
 * Maps to both old Muya options and new @muyajs/core IMuyaOptions
 */
export interface EditorOptions {
  // Content
  markdown?: string

  // Auto-pairing
  autoPairBracket?: boolean
  autoPairMarkdownSyntax?: boolean
  autoPairQuote?: boolean

  // List formatting
  bulletListMarker?: '-' | '*' | '+'
  orderListDelimiter?: '.' | ')'
  preferLooseListItem?: boolean
  listIndentation?: number | 'dfm'

  // Code blocks
  codeBlockLineNumbers?: boolean
  trimUnnecessaryCodeBlockEmptyLines?: boolean

  // UI hints
  hideQuickInsertHint?: boolean
  hideLinkPopup?: boolean

  // Editing behavior
  tabSize?: number
  spellcheckEnabled?: boolean

  // Display
  focusMode?: boolean
  fontSize?: number
  lineHeight?: number

  // Themes
  mermaidTheme?: 'default' | 'dark' | 'forest' | 'neutral'
  vegaTheme?: 'latimes' | 'dark' | 'excel' | 'fivethirtyeight'
  sequenceTheme?: 'hand' | 'simple'

  // Extended markdown features
  superSubScript?: boolean
  footnote?: boolean
  math?: boolean
  isGitlabCompatibilityEnabled?: boolean
  disableHtml?: boolean
  frontMatter?: boolean

  // Auto-check task lists
  autoCheck?: boolean
}

/**
 * Word count statistics
 */
export interface WordCount {
  words: number
  characters: number
  paragraphs: number
}

/**
 * Node offset for cursor positioning (new format)
 */
export interface NodeOffset {
  offset: number
}

/**
 * Legacy cursor position format (CodeMirror style)
 * Used in stored editor_state for backward compatibility
 */
export interface LegacyCursorPoint {
  line: number
  ch: number
}

/**
 * Cursor position in the editor
 * Compatible with both old and new Muya cursor formats
 */
export interface CursorPosition {
  // New offset-based format
  anchor?: NodeOffset | LegacyCursorPoint
  focus?: NodeOffset | LegacyCursorPoint
  start?: { offset: number } | LegacyCursorPoint
  end?: { offset: number } | LegacyCursorPoint
  // Selection state
  isCollapsed?: boolean
  isSelectionInSameBlock?: boolean
  direction?: string
  type?: string
}

/**
 * Table of contents item
 */
export interface TocItem {
  level: number
  content: string
  slug: string
  lvl?: number  // Alias for level (old API compatibility)
}

/**
 * History state for undo/redo
 */
export interface HistoryState {
  stack: any[]
  index: number
}

/**
 * Editor change event payload
 */
export interface EditorChangeEvent {
  markdown: string
  wordCount: WordCount
  cursor?: CursorPosition
  toc?: TocItem[]
  history?: HistoryState
}

/**
 * Selection change event payload
 */
export interface SelectionChangeEvent {
  anchor: NodeOffset | null
  focus: NodeOffset | null
  anchorBlock: any
  focusBlock: any
  isCollapsed: boolean
  direction: string
  type: string
}

/**
 * Format click event payload
 */
export interface FormatClickEvent {
  event: MouseEvent
  formatType: string
  data: any
}

/**
 * Selection formats info
 */
export interface SelectionFormats {
  formats: string[]
  tokens: any[]
  neighbors: any[]
}

/**
 * Editor scroll state for restoration
 */
export interface ScrollState {
  top: number
  left: number
}

/**
 * Complete editor state for save/restore
 */
export interface EditorState {
  cursor?: CursorPosition
  scroll?: ScrollState
}

/**
 * Image info for image operations
 */
export interface ImageInfo {
  token: any
  imageId: string
  block?: any
}

/**
 * Image update options
 */
export interface ImageUpdateOptions {
  alt?: string
  src?: string
  title?: string
}

/**
 * Event map for type-safe event handling
 */
export interface EditorEventMap {
  'change': EditorChangeEvent
  'selectionChange': SelectionChangeEvent
  'selectionFormats': SelectionFormats
  'format-click': FormatClickEvent
  'focus': void
  'blur': void
  'crashed': void
  'stateChange': { name: string; value: any }
}

/**
 * Plugin options for initialization
 */
export interface PluginOptions {
  /** Handler for image uploads (paste/drop) */
  imageAction?: (file: File) => Promise<string>
  /** Unsplash API key for image picker */
  unsplashAccessKey?: string
  /** Handler for link clicks */
  linkJumpClick?: (linkInfo: { href: string }) => void
}

/**
 * Format types supported by the editor
 */
export type FormatType =
  | 'strong'      // Bold
  | 'em'          // Italic
  | 'u'           // Underline (HTML)
  | 'del'         // Strikethrough
  | 'mark'        // Highlight
  | 'inline_code' // Inline code
  | 'inline_math' // Inline math
  | 'link'        // Link
  | 'image'       // Image
  | 'sub'         // Subscript
  | 'sup'         // Superscript

/**
 * Paragraph/block types for updateParagraph
 */
export type ParagraphType =
  | 'paragraph'
  | 'heading 1' | 'heading 2' | 'heading 3' | 'heading 4' | 'heading 5' | 'heading 6'
  | 'ul-bullet' | 'ul-dash' | 'ul-plus'
  | 'ol-order'
  | 'task-list'
  | 'blockquote'
  | 'pre'         // Code block
  | 'html'        // HTML block
  | 'math'        // Math block
  | 'hr'          // Horizontal rule
