/**
 * @inkdown/editor - Plugin Registration
 *
 * Registers UI plugins for the Muya editor.
 * Maps old plugin names to new @muyajs/core exports.
 */

import {
  Muya,
  // UI Components
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

import type { PluginOptions } from './types'

/**
 * Plugin name mapping from old Muya to new @muyajs/core
 *
 * Old Name (JavaScript Muya) -> New Name (@muyajs/core)
 * --------------------------------------------------------
 * TablePicker             -> TableColumnToolbar + TableRowColumMenu
 * QuickInsert             -> ParagraphQuickInsertMenu
 * CodePicker              -> CodeBlockLanguageSelector
 * EmojiPicker             -> EmojiSelector
 * ImagePathPicker         -> Part of ImageToolBar
 * ImageSelector           -> ImageEditTool
 * ImageToolbar            -> ImageToolBar + ImageResizeBar
 * Transformer             -> Built into core
 * FormatPicker            -> InlineFormatToolbar
 * FrontMenu               -> ParagraphFrontButton + ParagraphFrontMenu
 * LinkTools               -> Built into InlineFormatToolbar
 * FootnoteTool            -> Built into core
 * TableBarTools           -> TableDragBar
 */

let pluginsRegistered = false

/**
 * Register all Muya plugins
 * Call this once before creating any MuyaEditor instances
 */
export function registerMuyaPlugins(options: PluginOptions = {}): void {
  if (pluginsRegistered) {
    return
  }

  // Emoji selector (replaces EmojiPicker)
  Muya.use(EmojiSelector)

  // Inline formatting toolbar (replaces FormatPicker + LinkTools)
  Muya.use(InlineFormatToolbar)

  // Image tools (replaces ImageSelector, ImageToolbar, ImagePathPicker)
  Muya.use(ImageEditTool)
  Muya.use(ImageResizeBar)
  Muya.use(ImageToolBar, {
    ...(options.imageAction && { imageAction: options.imageAction }),
    ...(options.unsplashAccessKey && { unsplashAccessKey: options.unsplashAccessKey }),
  })

  // Code block language selector (replaces CodePicker)
  Muya.use(CodeBlockLanguageSelector)

  // Paragraph controls (replaces FrontMenu + QuickInsert)
  Muya.use(ParagraphFrontButton)
  Muya.use(ParagraphFrontMenu)
  Muya.use(ParagraphQuickInsertMenu)

  // Table tools (replaces TablePicker + TableBarTools)
  Muya.use(TableColumnToolbar)
  Muya.use(TableDragBar)
  Muya.use(TableRowColumMenu)

  // Preview toolbar for diagrams/math
  Muya.use(PreviewToolBar)

  pluginsRegistered = true
}

/**
 * Reset plugin registration state
 * Useful for testing or re-initialization
 */
export function resetPluginRegistration(): void {
  pluginsRegistered = false
  // Note: Muya.plugins is static, resetting this won't clear already-registered plugins
  // This is mainly for testing scenarios where you want to track registration calls
}

/**
 * Check if plugins have been registered
 */
export function arePluginsRegistered(): boolean {
  return pluginsRegistered
}

/**
 * Get the list of registered plugin names
 * Useful for debugging
 */
export function getRegisteredPluginNames(): string[] {
  return [
    'EmojiSelector',
    'InlineFormatToolbar',
    'ImageEditTool',
    'ImageResizeBar',
    'ImageToolBar',
    'CodeBlockLanguageSelector',
    'ParagraphFrontButton',
    'ParagraphFrontMenu',
    'ParagraphQuickInsertMenu',
    'TableColumnToolbar',
    'TableDragBar',
    'TableRowColumMenu',
    'PreviewToolBar',
  ]
}
