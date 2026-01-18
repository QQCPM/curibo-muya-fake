import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useEditorStore, usePreferencesStore, useAuthStore } from '@/stores';
import * as attachmentsService from '@/services/attachments.service';
// Import MuyaEditor from @inkdown/editor (TypeScript wrapper)
import { MuyaEditor } from '@inkdown/editor';
// Import Muya styles from @muyajs/core
import '@muyajs/core/lib/core.css';
// Import KaTeX CSS for math rendering
import 'katex/dist/katex.min.css';
// Import Prism CSS for code syntax highlighting
import 'prismjs/themes/prism.css';
// Import custom Muya style overrides
import '@/assets/styles/muya-overrides.css';
// Platform utilities
import { openExternal } from '@/utils/platform';
const editorStore = useEditorStore();
const preferencesStore = usePreferencesStore();
const authStore = useAuthStore();
const editorRef = ref();
let editor = null;
const autoSaveTimer = ref();
const isEditorReady = ref(false);
const isUploadingImage = ref(false);
/**
 * Handle image upload from paste/drop
 * Returns the URL to use in the editor
 */
async function handleImageUpload(file) {
    if (!authStore.user?.id) {
        console.warn('Cannot upload image: user not authenticated');
        return URL.createObjectURL(file); // Fallback to local URL
    }
    isUploadingImage.value = true;
    try {
        const noteId = editorStore.currentDocument?.id;
        const result = await attachmentsService.uploadAttachment(file, authStore.user.id, noteId);
        if (result.error) {
            console.error('Failed to upload image:', result.error);
            return URL.createObjectURL(file); // Fallback to local URL
        }
        const attachment = Array.isArray(result.data) ? result.data[0] : result.data;
        if (attachment) {
            // Get signed URL for the uploaded image
            const urlResult = await attachmentsService.getAttachmentUrl(attachment.storage_path);
            if (urlResult.url) {
                return urlResult.url;
            }
        }
        return URL.createObjectURL(file); // Fallback to local URL
    }
    catch (error) {
        console.error('Error uploading image:', error);
        return URL.createObjectURL(file); // Fallback to local URL
    }
    finally {
        isUploadingImage.value = false;
    }
}
// Initialize the MuyaEditor
async function initializeEditor() {
    if (!editorRef.value)
        return;
    // Create the editor instance with options
    editor = new MuyaEditor(editorRef.value, {
        markdown: editorStore.currentDocument?.content || '',
        focusMode: preferencesStore.focus,
        preferLooseListItem: preferencesStore.preferLooseListItem,
        autoPairBracket: preferencesStore.autoPairBracket,
        autoPairMarkdownSyntax: preferencesStore.autoPairMarkdownSyntax,
        autoPairQuote: preferencesStore.autoPairQuote,
        bulletListMarker: preferencesStore.bulletListMarker,
        orderListDelimiter: preferencesStore.orderListDelimiter,
        tabSize: preferencesStore.tabSize,
        fontSize: preferencesStore.fontSize,
        lineHeight: preferencesStore.lineHeight,
        codeBlockLineNumbers: preferencesStore.codeBlockLineNumbers,
        listIndentation: preferencesStore.listIndentation,
        hideQuickInsertHint: preferencesStore.hideQuickInsertHint,
        hideLinkPopup: preferencesStore.hideLinkPopup,
        spellcheckEnabled: false,
        trimUnnecessaryCodeBlockEmptyLines: preferencesStore.trimUnnecessaryCodeBlockEmptyLines,
        mermaidTheme: preferencesStore.theme.includes('dark') ? 'dark' : 'default',
        vegaTheme: preferencesStore.theme.includes('dark') ? 'dark' : 'latimes',
        superSubScript: true,
        footnote: true,
        math: true,
        isGitlabCompatibilityEnabled: true,
        disableHtml: false,
    });
    // Initialize with plugin configuration
    await editor.init({
        imageAction: handleImageUpload,
        unsplashAccessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '',
        linkJumpClick: (linkInfo) => openExternal(linkInfo.href),
    });
    // Restore editor state (cursor and scroll position) after initialization
    const currentDoc = editorStore.currentDocument;
    if (currentDoc?.editor_state) {
        nextTick(() => {
            try {
                // Restore cursor position
                if (currentDoc.editor_state?.cursor && editor) {
                    editor.setCursor(currentDoc.editor_state.cursor);
                }
                // Restore scroll position
                if (currentDoc.editor_state?.scroll && editor) {
                    const container = editor.container;
                    if (container) {
                        container.scrollTop = currentDoc.editor_state.scroll.top || 0;
                        container.scrollLeft = currentDoc.editor_state.scroll.left || 0;
                    }
                }
            }
            catch (error) {
                console.warn('Failed to restore editor state:', error);
            }
        });
    }
    // Handle content changes (typed event!)
    editor.on('change', (changes) => {
        const { markdown, wordCount, cursor, toc } = changes;
        // Update store
        editorStore.updateContent(markdown, wordCount);
        if (cursor) {
            editorStore.updateCursor(cursor);
        }
        if (toc) {
            editorStore.updateToc(toc);
        }
        // Auto-save with debounce
        if (autoSaveTimer.value) {
            clearTimeout(autoSaveTimer.value);
        }
        if (preferencesStore.autoSave) {
            autoSaveTimer.value = setTimeout(() => {
                editorStore.saveDocument();
            }, preferencesStore.autoSaveDelay);
        }
    });
    // Handle link clicks
    editor.on('format-click', ({ event, formatType, data }) => {
        const ctrlOrMeta = (navigator.platform.includes('Mac') && event.metaKey) ||
            (!navigator.platform.includes('Mac') && event.ctrlKey);
        if (formatType === 'link' && ctrlOrMeta && data?.href) {
            openExternal(data.href);
        }
    });
    // Handle selection changes
    editor.on('selectionChange', () => {
        // Could dispatch to store for toolbar state
    });
    isEditorReady.value = true;
}
// Watch for document changes
watch(() => editorStore.currentDocument, (newDoc, oldDoc) => {
    if (newDoc && editor && newDoc.id !== oldDoc?.id) {
        // Switch to new document content, restoring cursor position if available
        editor.setMarkdown(newDoc.content, newDoc.editor_state?.cursor);
    }
});
// Watch for preference changes
watch(() => preferencesStore.focus, (value) => {
    editor?.setFocusMode(value);
});
watch(() => preferencesStore.fontSize, (value) => {
    editor?.setFont({ fontSize: value });
});
watch(() => preferencesStore.lineHeight, (value) => {
    editor?.setFont({ lineHeight: value });
});
watch(() => preferencesStore.tabSize, (value) => {
    editor?.setTabSize(value);
});
watch(() => preferencesStore.theme, (value) => {
    const isDark = value.includes('dark');
    editor?.setOptions({
        mermaidTheme: isDark ? 'dark' : 'default',
        vegaTheme: isDark ? 'dark' : 'latimes'
    }, true);
});
// Keyboard shortcuts
function handleKeydown(event) {
    // Save: Cmd/Ctrl + S
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        editorStore.saveDocument();
    }
    // Undo: Cmd/Ctrl + Z
    if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        editor?.undo();
    }
    // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
    if ((event.metaKey || event.ctrlKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        editor?.redo();
    }
}
onMounted(() => {
    initializeEditor();
    window.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    if (autoSaveTimer.value) {
        clearTimeout(autoSaveTimer.value);
    }
    if (editor) {
        try {
            editor.destroy();
        }
        catch (e) {
            // Ignore cleanup errors
        }
        editor = null;
    }
});
// Expose editor instance for parent components (e.g., format toolbar)
const getMuya = () => editor;
const __VLS_exposed = { getMuya, isEditorReady, isUploadingImage };
defineExpose(__VLS_exposed);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-math']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-math']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-hide']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-math']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-hide']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-math-render']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-math']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-hide']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-math-render']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-math']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-hide']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-container-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-container-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['katex']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-fence-code']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-task-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-inline-footnote-identifier']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-link']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-front-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-front-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-front-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-front-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-front-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-front-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-front-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-front-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-front-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-task-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-task-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-task-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-task-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-task-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-task-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-task-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-checkbox-checked']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-task-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-checkbox-checked']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-tool-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-tool-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-tool-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-quick-insert']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-container']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-quick-insert']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-container']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-container']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-tool-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-container']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-front-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-image-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-image-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-front-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-front-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-paragraph']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-front-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-code-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-table-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-table-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-format-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-format-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-link-tools']} */ ;
/** @type {__VLS_StyleScopedClasses['ag-link-tools']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "editor-area" },
    ...{ class: ({
            'typewriter-mode': __VLS_ctx.preferencesStore.typewriter,
            'focus-mode': __VLS_ctx.preferencesStore.focus,
            'source-mode': __VLS_ctx.preferencesStore.sourceCode
        }) },
    ...{ style: ({
            '--editor-font-size': `${__VLS_ctx.preferencesStore.fontSize}px`,
            '--editor-line-height': __VLS_ctx.preferencesStore.lineHeight
        }) },
});
/** @type {__VLS_StyleScopedClasses['editor-area']} */ ;
/** @type {__VLS_StyleScopedClasses['typewriter-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['source-mode']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "editorRef",
    ...{ class: "muya-editor" },
    dir: (__VLS_ctx.preferencesStore.textDirection),
});
/** @type {__VLS_StyleScopedClasses['muya-editor']} */ ;
if (!__VLS_ctx.isEditorReady) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "editor-loading" },
    });
    /** @type {__VLS_StyleScopedClasses['editor-loading']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "loading-spinner" },
    });
    /** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
// @ts-ignore
[preferencesStore, preferencesStore, preferencesStore, preferencesStore, preferencesStore, preferencesStore, isEditorReady,];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => (__VLS_exposed),
});
export default {};
