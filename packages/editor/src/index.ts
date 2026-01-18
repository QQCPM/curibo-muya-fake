/**
 * @inkdown/editor - Main Entry Point
 *
 * A TypeScript wrapper around @muyajs/core that provides a backward-compatible
 * API for the Inkdown markdown editor.
 *
 * @example
 * ```typescript
 * import { MuyaEditor, type EditorOptions } from '@inkdown/editor'
 *
 * const editor = new MuyaEditor(container, {
 *   markdown: '# Hello World',
 *   focusMode: false,
 * })
 *
 * await editor.init({
 *   imageAction: async (file) => uploadImage(file),
 * })
 *
 * editor.on('change', ({ markdown, wordCount }) => {
 *   console.log('Content changed:', wordCount.words, 'words')
 * })
 * ```
 */

// Main editor class
export { MuyaEditor } from './MuyaEditor'

// Plugin registration utilities
export {
  registerMuyaPlugins,
  resetPluginRegistration,
  arePluginsRegistered,
  getRegisteredPluginNames,
} from './plugins'

// Type exports
export type {
  // Core types
  EditorOptions,
  PluginOptions,
  TState,

  // Event types
  EditorEventMap,
  EditorChangeEvent,
  SelectionChangeEvent,
  FormatClickEvent,
  SelectionFormats,

  // Data types
  WordCount,
  CursorPosition,
  NodeOffset,
  LegacyCursorPoint,
  TocItem,
  HistoryState,
  EditorState,
  ScrollState,

  // Image types
  ImageInfo,
  ImageUpdateOptions,

  // Format/paragraph types
  FormatType,
  ParagraphType,
} from './types'

// Re-export from @muyajs/core for advanced usage
export {
  Muya,
  MarkdownToHtml,
  // Locales
  en,
  zh,
  ja,
  // UI Components (for custom plugin configuration)
  EmojiSelector,
  InlineFormatToolbar,
  ImageEditTool,
  ImageResizeBar,
  ImageToolBar,
  CodeBlockLanguageSelector,
  ParagraphFrontButton,
  ParagraphFrontMenu,
  ParagraphQuickInsertMenu,
  TableColumnToolbar,
  TableDragBar,
  TableRowColumMenu,
  PreviewToolBar,
} from '@muyajs/core'
