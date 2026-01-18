/**
 * @inkdown/editor - MuyaEditor Wrapper Class
 *
 * Provides a backward-compatible API wrapper around the new @muyajs/core
 * while maintaining the interface expected by the Vue components.
 */

import { Muya, en, type TState } from '@muyajs/core'
import { registerMuyaPlugins } from './plugins'
import type { IMuyaOptions } from './types'

// Listener type for event handling
type Listener = (...args: any[]) => void
import type {
  EditorOptions,
  EditorEventMap,
  EditorChangeEvent,
  CursorPosition,
  PluginOptions,
  WordCount,
  TocItem,
  FormatType,
  ParagraphType,
  SelectionFormats,
} from './types'

// Type for the internal Content/Format block that has the format method
interface FormatBlock {
  format(type: string): void
  text: string
  setCursor(begin: number, end: number, needUpdate?: boolean): void
  getCursor(): CursorPosition | null
  getFormatsInRange(): SelectionFormats
  convertToParagraph(force?: boolean): void
  convertToTaskList?(): void
}

// Type for scroll page that has replaceBlockByLabel
interface ScrollPage {
  replaceBlockByLabel(block: any, label: string, text?: string): any
}

/**
 * MuyaEditor - Wrapper class for @muyajs/core
 *
 * Provides the same API surface as the old JavaScript Muya while using
 * the new TypeScript implementation internally.
 */
export class MuyaEditor {
  private muya: Muya | null = null
  private containerElement: HTMLElement
  private editorOptions: EditorOptions
  private eventListeners: Map<string, Set<Function>> = new Map()
  private initialized = false

  /**
   * Create a new MuyaEditor instance
   * @param container - The HTML element to mount the editor in
   * @param options - Editor configuration options
   */
  constructor(container: HTMLElement, options: EditorOptions = {}) {
    this.containerElement = container
    this.editorOptions = options
  }

  /**
   * Initialize the editor with plugins
   * Must be called after construction
   * @param pluginOptions - Plugin-specific configuration
   */
  async init(pluginOptions: PluginOptions = {}): Promise<void> {
    if (this.initialized) {
      console.warn('MuyaEditor already initialized')
      return
    }

    // Register plugins first
    registerMuyaPlugins(pluginOptions)

    // Map options to @muyajs/core format
    const muyaOptions = this.mapOptions(this.editorOptions)

    // Create the Muya instance
    this.muya = new Muya(this.containerElement, muyaOptions)

    // Set locale (default to English)
    this.muya.locale(en)

    // Initialize the editor and UI plugins
    this.muya.init()

    // Set up event forwarding
    this.setupEventForwarding()

    this.initialized = true
  }

  /**
   * Map EditorOptions to IMuyaOptions
   */
  private mapOptions(options: EditorOptions): Partial<IMuyaOptions> {
    return {
      markdown: options.markdown,
      fontSize: options.fontSize ?? 16,
      lineHeight: options.lineHeight ?? 1.6,
      focusMode: options.focusMode ?? false,
      autoPairBracket: options.autoPairBracket ?? true,
      autoPairMarkdownSyntax: options.autoPairMarkdownSyntax ?? true,
      autoPairQuote: options.autoPairQuote ?? true,
      bulletListMarker: options.bulletListMarker ?? '-',
      orderListDelimiter: options.orderListDelimiter ?? '.',
      preferLooseListItem: options.preferLooseListItem ?? true,
      tabSize: options.tabSize ?? 4,
      codeBlockLineNumbers: options.codeBlockLineNumbers ?? false,
      listIndentation: typeof options.listIndentation === 'number'
        ? options.listIndentation
        : 1,
      hideQuickInsertHint: options.hideQuickInsertHint ?? false,
      hideLinkPopup: options.hideLinkPopup ?? false,
      trimUnnecessaryCodeBlockEmptyLines: options.trimUnnecessaryCodeBlockEmptyLines ?? false,
      mermaidTheme: options.mermaidTheme ?? 'default',
      vegaTheme: options.vegaTheme ?? 'latimes',
      spellcheckEnabled: options.spellcheckEnabled ?? false,
      superSubScript: options.superSubScript ?? false,
      footnote: options.footnote ?? false,
      math: options.math ?? true,
      isGitlabCompatibilityEnabled: options.isGitlabCompatibilityEnabled ?? false,
      disableHtml: options.disableHtml ?? false,
      frontMatter: options.frontMatter ?? true,
      autoCheck: options.autoCheck ?? false,
    }
  }

  /**
   * Set up event forwarding from Muya to our event system
   */
  private setupEventForwarding(): void {
    if (!this.muya) return

    // Forward change events
    this.muya.on('json-change', (data: any) => {
      const markdown = this.getMarkdown()
      const wordCount = this.calculateWordCount(markdown)

      this.emit('change', {
        markdown,
        wordCount,
        cursor: this.getCursor() ?? undefined,
        toc: this.getTOC(),
      })
    })

    // Forward selection change events
    this.muya.on('selection-change', (data: any) => {
      this.emit('selectionChange', data)

      // Also emit selection formats for toolbar state
      const formats = this.getSelectionFormats()
      if (formats) {
        this.emit('selectionFormats', formats)
      }
    })

    // Forward format click events
    this.muya.on('format-click', (data: any) => {
      this.emit('format-click', data)
    })
  }

  /**
   * Calculate word count from markdown
   */
  private calculateWordCount(markdown: string): WordCount {
    const text = markdown.replace(/[#*`_~\[\]()]/g, '')
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
    const characters = text.length
    const paragraphs = markdown.split(/\n\n+/).filter(p => p.trim().length > 0).length

    return { words, characters, paragraphs }
  }

  // ============================================
  // Event Emitter Methods
  // ============================================

  /**
   * Subscribe to an editor event
   */
  on<K extends keyof EditorEventMap>(
    event: K,
    callback: (data: EditorEventMap[K]) => void
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)

    // Also forward to Muya's internal event system for some events
    if (this.muya && ['focus', 'blur'].includes(event)) {
      this.muya.on(event, callback as Listener)
    }
  }

  /**
   * Unsubscribe from an editor event
   */
  off<K extends keyof EditorEventMap>(
    event: K,
    callback: (data: EditorEventMap[K]) => void
  ): void {
    this.eventListeners.get(event)?.delete(callback)

    if (this.muya && ['focus', 'blur'].includes(event)) {
      this.muya.off(event, callback as Listener)
    }
  }

  /**
   * Subscribe to an event once
   */
  once<K extends keyof EditorEventMap>(
    event: K,
    callback: (data: EditorEventMap[K]) => void
  ): void {
    const onceCallback = (data: EditorEventMap[K]) => {
      callback(data)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }

  /**
   * Emit an event to all listeners
   */
  private emit<K extends keyof EditorEventMap>(
    event: K,
    data: EditorEventMap[K]
  ): void {
    this.eventListeners.get(event)?.forEach(cb => {
      try {
        cb(data)
      } catch (err) {
        console.error(`Error in ${event} event handler:`, err)
      }
    })
  }

  // ============================================
  // Content Methods
  // ============================================

  /**
   * Get the current markdown content
   */
  getMarkdown(): string {
    return this.muya?.getMarkdown() ?? ''
  }

  /**
   * Get the editor state as JSON
   */
  getState(): TState[] {
    return this.muya?.getState() ?? []
  }

  /**
   * Set the editor content from markdown
   * @param markdown - The markdown content
   * @param cursor - Optional cursor position to restore
   * @param isRenderCursor - Whether to render the cursor (default: true)
   */
  setMarkdown(markdown: string, cursor?: CursorPosition, isRenderCursor = true): void {
    if (!this.muya) return

    // Set content using the new API
    this.muya.setContent(markdown, isRenderCursor)

    // Restore cursor position if provided
    if (cursor && isRenderCursor) {
      // Schedule cursor restoration after content is rendered
      requestAnimationFrame(() => {
        this.setCursor(cursor)
      })
    }
  }

  /**
   * Set the editor content (alias for setMarkdown for new API compatibility)
   */
  setContent(content: TState[] | string, autoFocus = true): void {
    this.muya?.setContent(content, autoFocus)
  }

  // ============================================
  // Cursor & Selection Methods
  // ============================================

  /**
   * Get the current cursor position
   */
  getCursor(): CursorPosition | null {
    const block = this.getActiveContentBlock()
    if (block && 'getCursor' in block) {
      return (block as FormatBlock).getCursor()
    }
    return null
  }

  /**
   * Set the cursor position
   * Supports both legacy { line, ch } format and new { offset } format
   */
  setCursor(cursor: CursorPosition): void {
    if (!this.muya) return

    // Helper to extract offset from either format
    const getOffset = (point: any): number | null => {
      if (!point) return null
      // New format: { offset: number }
      if (typeof point.offset === 'number') return point.offset
      // Legacy format: { line, ch } - approximate by using ch as offset
      // Note: This is a simplification; proper conversion would need line info
      if (typeof point.ch === 'number') return point.ch
      return null
    }

    const block = this.getActiveContentBlock()
    if (!block || !('setCursor' in block)) return

    // Try to get start/end offsets from either format
    let startOffset: number | null = null
    let endOffset: number | null = null

    if (cursor.start) {
      startOffset = getOffset(cursor.start)
      endOffset = getOffset(cursor.end ?? cursor.start)
    } else if (cursor.anchor) {
      startOffset = getOffset(cursor.anchor)
      endOffset = getOffset(cursor.focus ?? cursor.anchor)
    }

    if (startOffset !== null && endOffset !== null) {
      (block as FormatBlock).setCursor(startOffset, endOffset, true)
    }
  }

  /**
   * Get the current selection info
   */
  getSelection(): any {
    return this.muya?.editor?.selection?.getSelection() ?? null
  }

  /**
   * Select all content
   */
  selectAll(): void {
    this.muya?.selectAll()
  }

  /**
   * Get formats in the current selection
   */
  getSelectionFormats(): SelectionFormats | null {
    const block = this.getActiveContentBlock()
    if (block && 'getFormatsInRange' in block) {
      return (block as FormatBlock).getFormatsInRange()
    }
    return null
  }

  // ============================================
  // Formatting Methods
  // ============================================

  /**
   * Apply inline formatting to the selection
   * @param type - The format type (strong, em, del, u, link, image, etc.)
   */
  format(type: FormatType | string): void {
    const block = this.getActiveContentBlock()
    if (block && 'format' in block) {
      (block as FormatBlock).format(type)
    }
  }

  /**
   * Convert the current paragraph to a different type
   * @param type - The paragraph type (heading 1, ul-bullet, blockquote, etc.)
   */
  updateParagraph(type: ParagraphType | string): void {
    const block = this.getActiveContentBlock()
    if (!block) return

    // Handle special cases
    if (type === 'task-list' && 'convertToTaskList' in block) {
      (block as FormatBlock).convertToTaskList?.()
      return
    }

    if (type === 'paragraph' && 'convertToParagraph' in block) {
      (block as FormatBlock).convertToParagraph(true)
      return
    }

    // For other types, try to use replaceBlockByLabel if available
    const scrollPage = this.muya?.editor?.scrollPage as ScrollPage | null
    if (scrollPage && 'replaceBlockByLabel' in scrollPage) {
      try {
        // Map type names to block labels
        const labelMap: Record<string, string> = {
          'heading 1': 'atx-heading',
          'heading 2': 'atx-heading',
          'heading 3': 'atx-heading',
          'heading 4': 'atx-heading',
          'heading 5': 'atx-heading',
          'heading 6': 'atx-heading',
          'ul-bullet': 'bullet-list',
          'ul-dash': 'bullet-list',
          'ul-plus': 'bullet-list',
          'ol-order': 'order-list',
          'blockquote': 'block-quote',
          'pre': 'code-block',
          'hr': 'thematic-break',
        }

        const label = labelMap[type] ?? type
        const anchor = (block as any).getAnchor?.()
        if (anchor) {
          scrollPage.replaceBlockByLabel(anchor, label)
        }
      } catch (err) {
        console.warn('updateParagraph failed:', err)
      }
    }
  }

  // ============================================
  // History Methods
  // ============================================

  /**
   * Undo the last action
   */
  undo(): void {
    this.muya?.undo()
  }

  /**
   * Redo the last undone action
   */
  redo(): void {
    this.muya?.redo()
  }

  /**
   * Get the history state
   */
  getHistory(): any {
    return this.muya?.editor?.history ?? null
  }

  /**
   * Set the history state
   */
  setHistory(history: any): void {
    // History restoration is not directly supported in new API
    // This is a no-op for now
    console.warn('setHistory is not implemented in the new Muya API')
  }

  /**
   * Clear the history
   */
  clearHistory(): void {
    // Clear history by reinitializing
    const content = this.getMarkdown()
    this.muya?.setContent(content, false)
  }

  // ============================================
  // Search Methods
  // ============================================

  /**
   * Search for a value in the document
   */
  search(value: string, opts: any = {}): any {
    return this.muya?.search(value, opts) ?? null
  }

  /**
   * Find the next/previous search result
   */
  find(action: 'previous' | 'next'): any {
    return this.muya?.find(action) ?? null
  }

  /**
   * Replace the current search result
   */
  replace(replaceValue: string, opts: any = {}): any {
    return this.muya?.replace(replaceValue, opts) ?? null
  }

  // ============================================
  // Display Options Methods
  // ============================================

  /**
   * Set focus mode
   */
  setFocusMode(enabled: boolean): void {
    if (!this.muya) return

    // Update the option
    this.muya.options.focusMode = enabled

    // Trigger re-render
    const container = this.muya.domNode
    if (enabled) {
      container.classList.add('mu-focus-mode')
    } else {
      container.classList.remove('mu-focus-mode')
    }
  }

  /**
   * Set font options
   */
  setFont(options: { fontSize?: number; lineHeight?: number }): void {
    if (!this.muya) return

    if (options.fontSize !== undefined) {
      this.muya.options.fontSize = options.fontSize
      this.muya.domNode.style.fontSize = `${options.fontSize}px`
    }

    if (options.lineHeight !== undefined) {
      this.muya.options.lineHeight = options.lineHeight
      this.muya.domNode.style.lineHeight = String(options.lineHeight)
    }
  }

  /**
   * Set tab size
   */
  setTabSize(size: number): void {
    if (!this.muya) return

    const tabSize = Math.max(1, Math.min(4, size))
    this.muya.options.tabSize = tabSize
  }

  /**
   * Set list indentation
   */
  setListIndentation(indentation: number | 'dfm'): void {
    if (!this.muya) return

    if (typeof indentation === 'number') {
      this.muya.options.listIndentation = Math.max(1, Math.min(4, indentation))
    }
    // 'dfm' mode not directly supported in new API
  }

  /**
   * Update multiple options at once
   */
  setOptions(options: Partial<EditorOptions>, needRender = false): void {
    if (!this.muya) return

    // Map and apply options
    const mapped = this.mapOptions(options)
    Object.assign(this.muya.options, mapped)

    // Handle specific option changes that require DOM updates
    if (options.hideQuickInsertHint !== undefined) {
      const container = this.muya.domNode
      if (options.hideQuickInsertHint) {
        container.classList.remove('mu-show-quick-insert-hint')
      } else {
        container.classList.add('mu-show-quick-insert-hint')
      }
    }

    if (options.spellcheckEnabled !== undefined) {
      this.muya.domNode.setAttribute('spellcheck', String(options.spellcheckEnabled))
    }

    // Re-render if requested
    if (needRender) {
      // Force content refresh
      const content = this.getMarkdown()
      this.muya.setContent(content, false)
    }
  }

  // ============================================
  // Focus Methods
  // ============================================

  /**
   * Focus the editor
   */
  focus(): void {
    this.muya?.focus()
  }

  /**
   * Check if the editor has focus
   */
  hasFocus(): boolean {
    return document.activeElement === this.muya?.domNode
  }

  /**
   * Blur the editor
   */
  blur(isRemoveAllRange = false, unSelect = false): void {
    if (isRemoveAllRange) {
      const selection = document.getSelection()
      selection?.removeAllRanges()
    }

    // Clear any selected images or table cells
    if (unSelect && this.muya?.editor?.selection) {
      (this.muya.editor.selection as any).selectedImage = null
    }

    this.hideAllFloatTools()
    this.muya?.domNode?.blur()
  }

  // ============================================
  // Table of Contents
  // ============================================

  /**
   * Get the table of contents
   */
  getTOC(): TocItem[] {
    const state = this.getState()
    const toc: TocItem[] = []

    // Extract headings from state
    const extractHeadings = (blocks: TState[]) => {
      for (const block of blocks) {
        const blockAny = block as any
        if (blockAny.name === 'atx-heading' || blockAny.name === 'setext-heading') {
          const meta = blockAny.meta as any
          const level = meta?.level ?? 1
          const content = (blockAny.text ?? '') as string

          toc.push({
            level,
            content: content.replace(/^#{1,6}\s*/, ''),
            slug: content.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            lvl: level, // Alias for compatibility
          })
        }

        if (blockAny.children) {
          extractHeadings(blockAny.children as TState[])
        }
      }
    }

    extractHeadings(state)
    return toc
  }

  // ============================================
  // Export Methods
  // ============================================

  /**
   * Export the content as HTML
   */
  exportHtml(): string {
    // TODO: Implement HTML export using MarkdownToHtml
    const markdown = this.getMarkdown()
    // For now, return basic HTML
    return `<div class="markdown-body">${markdown}</div>`
  }

  /**
   * Export styled HTML
   */
  exportStyledHTML(options?: any): string {
    // TODO: Implement styled HTML export
    return this.exportHtml()
  }

  // ============================================
  // Image Methods
  // ============================================

  /**
   * Insert an image
   */
  insertImage(imageInfo: { src: string; alt?: string; title?: string }): void {
    const { src, alt = '', title = '' } = imageInfo
    const markdown = title
      ? `![${alt}](${src} "${title}")`
      : `![${alt}](${src})`

    // Insert at current cursor position
    // This is a simplified implementation
    const block = this.getActiveContentBlock()
    if (block && 'text' in block) {
      const cursor = this.getCursor()
      const offset = this.getOffsetFromPoint(cursor?.start) ?? 0
      const text = (block as FormatBlock).text
      ;(block as any).text = text.slice(0, offset) + markdown + text.slice(offset)
    }
  }

  /**
   * Extract all image URLs from the document
   */
  extractImages(markdown?: string): string[] {
    const content = markdown ?? this.getMarkdown()
    const imageRegex = /!\[.*?\]\((.*?)(?:\s+".*?")?\)/g
    const images: string[] = []
    let match

    while ((match = imageRegex.exec(content)) !== null) {
      images.push(match[1])
    }

    return images
  }

  // ============================================
  // Clipboard Methods
  // ============================================

  /**
   * Copy selection as markdown
   */
  copyAsMarkdown(): void {
    const clipboard = this.muya?.editor?.clipboard as any
    clipboard?.copy?.()
  }

  /**
   * Copy selection as HTML
   */
  copyAsHtml(): void {
    const clipboard = this.muya?.editor?.clipboard as any
    clipboard?.copy?.()
  }

  /**
   * Paste as plain text
   */
  pasteAsPlainText(): void {
    // Note: Paste operations are typically triggered by browser events
    // This is a no-op in the new API
    console.warn('pasteAsPlainText is not directly supported in the new Muya API')
  }

  // ============================================
  // UI Plugin Access
  // ============================================

  /**
   * Get a UI plugin by name
   */
  private getUIPlugin(name: string): any {
    return (this.muya as any)?._uiPlugins?.[name] ?? null
  }

  /**
   * Get the table picker/column toolbar
   * Used by FormatToolbar for inserting tables
   */
  get tablePicker(): any {
    // Return a compatibility shim that uses createTable
    return {
      show: (options?: { row?: number; column?: number }) => {
        this.createTable(options)
      }
    }
  }

  /**
   * Get the image selector
   * Used by FormatToolbar for inserting images
   */
  get imageSelector(): any {
    // Return a compatibility shim that triggers image format
    return {
      show: () => {
        // Use the format method to insert an image placeholder
        // This will open the image picker dialog in new Muya
        this.format('image')
      }
    }
  }

  /**
   * Get the quick insert menu
   */
  get quickInsert(): any {
    return this.getUIPlugin('paragraphQuickInsertMenu')
  }

  /**
   * Get the code picker
   */
  get codePicker(): any {
    return this.getUIPlugin('codeBlockLanguageSelector')
  }

  /**
   * Get the emoji picker
   */
  get emojiPicker(): any {
    return this.getUIPlugin('emojiSelector')
  }

  /**
   * Hide all floating UI tools
   */
  hideAllFloatTools(): void {
    this.muya?.ui?.hideAllFloatTools()
  }

  // ============================================
  // Internal Helpers
  // ============================================

  /**
   * Get the active content block (Format block with formatting methods)
   */
  private getActiveContentBlock(): FormatBlock | null {
    return this.muya?.editor?.activeContentBlock as FormatBlock | null
  }

  /**
   * Extract offset from a cursor point (supports both legacy and new formats)
   * @param point - Cursor point in either { offset } or { line, ch } format
   * @returns The offset value, or null if not available
   */
  private getOffsetFromPoint(point: any): number | null {
    if (!point) return null
    // New format: { offset: number }
    if (typeof point.offset === 'number') return point.offset
    // Legacy format: { line, ch } - use ch as approximation
    if (typeof point.ch === 'number') return point.ch
    return null
  }

  /**
   * Get the DOM container
   */
  get container(): HTMLElement {
    return this.muya?.domNode ?? this.containerElement
  }

  /**
   * Get the raw Muya instance (escape hatch for advanced usage)
   */
  get rawInstance(): Muya | null {
    return this.muya
  }

  /**
   * Check if the editor is initialized
   */
  get isInitialized(): boolean {
    return this.initialized
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Destroy the editor and clean up resources
   */
  destroy(): void {
    if (this.muya) {
      this.muya.destroy()
      this.muya = null
    }

    this.eventListeners.clear()
    this.initialized = false
  }

  /**
   * Create a new table
   * Helper method for FormatToolbar
   */
  createTable(options?: { row?: number; column?: number }): void {
    const { row = 3, column = 3 } = options ?? {}

    // Try to use Muya's internal table creation if available
    const scrollPage = this.muya?.editor?.scrollPage as any
    if (scrollPage?.insertTableBlock) {
      try {
        scrollPage.insertTableBlock({ rows: row, columns: column })
        return
      } catch (err) {
        // Fall through to markdown insertion
      }
    }

    // Fallback: Insert table markdown at cursor
    const headers = Array(column).fill('Header').join(' | ')
    const separator = Array(column).fill('---').join(' | ')
    const dataRows = Array(row - 1)
      .fill(null)
      .map(() => Array(column).fill('Cell').join(' | '))
      .join(' |\n| ')

    const tableMarkdown = `\n| ${headers} |\n| ${separator} |\n| ${dataRows} |\n`

    // Get current content and insert table
    const markdown = this.getMarkdown()
    const block = this.getActiveContentBlock()

    if (block && 'text' in block) {
      const cursor = this.getCursor()
      const offset = this.getOffsetFromPoint(cursor?.start) ?? (block as FormatBlock).text.length

      // Find the block's position in markdown and insert after current line
      const blockText = (block as FormatBlock).text
      const insertPos = markdown.indexOf(blockText)

      if (insertPos !== -1) {
        const beforeInsert = markdown.slice(0, insertPos + blockText.length)
        const afterInsert = markdown.slice(insertPos + blockText.length)
        const newMarkdown = beforeInsert + tableMarkdown + afterInsert
        this.setMarkdown(newMarkdown)
      }
    } else {
      // Just append at the end
      this.setMarkdown(markdown + '\n' + tableMarkdown)
    }
  }

  /**
   * Insert a horizontal rule
   */
  insertHorizontalRule(): void {
    this.updateParagraph('hr')
  }
}
