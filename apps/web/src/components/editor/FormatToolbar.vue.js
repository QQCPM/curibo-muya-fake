import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { usePreferencesStore, useLayoutStore } from '@/stores';
import { Bold, Italic, Underline, Strikethrough, Code, Link2, List, ListOrdered, Quote, Image, CheckSquare, Table2, Sparkles, Heading1, Heading2, Heading3 } from 'lucide-vue-next';
const preferencesStore = usePreferencesStore();
const layoutStore = useLayoutStore();
const props = defineProps();
// Visibility state
const isVisible = ref(true);
const isHovered = ref(false);
// Scroll tracking
let lastScrollY = 0;
let scrollTimeout = null;
let ticking = false;
// Format functions
function format(type) {
    if (!props.muyaInstance)
        return;
    props.muyaInstance.format(type);
}
function updateParagraph(type) {
    if (!props.muyaInstance)
        return;
    props.muyaInstance.updateParagraph(type);
}
function insertTable() {
    if (!props.muyaInstance)
        return;
    props.muyaInstance.tablePicker?.show({ row: 3, column: 3 });
}
function insertImage() {
    if (!props.muyaInstance)
        return;
    props.muyaInstance.imageSelector?.show();
}
function insertTaskList() {
    if (!props.muyaInstance)
        return;
    props.muyaInstance.updateParagraph('task-list');
}
function insertCodeBlock() {
    if (!props.muyaInstance)
        return;
    props.muyaInstance.updateParagraph('pre');
}
function handleAI() {
    layoutStore.toggleRightPanel();
}
// Smart scroll behavior
function handleScroll(e) {
    if (isHovered.value)
        return; // Don't hide while hovering
    const target = e.target;
    const currentScrollY = target.scrollTop;
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const delta = currentScrollY - lastScrollY;
            // Clear existing timeout
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            // Scrolling down - hide (only if scrolled past threshold)
            if (delta > 5 && currentScrollY > 100) {
                isVisible.value = false;
            }
            // Scrolling up - show
            else if (delta < -5) {
                isVisible.value = true;
            }
            // Show after stopping scroll
            scrollTimeout = setTimeout(() => {
                isVisible.value = true;
            }, 800);
            lastScrollY = currentScrollY;
            ticking = false;
        });
        ticking = true;
    }
}
// Attach scroll listener
function attachScrollListener() {
    // Find the Muya editor container
    const container = props.scrollContainer || document.querySelector('.muya-editor');
    if (container) {
        container.addEventListener('scroll', handleScroll, { passive: true });
        return container;
    }
    return null;
}
let scrollElement = null;
onMounted(() => {
    // Delay to ensure DOM is ready
    setTimeout(() => {
        scrollElement = attachScrollListener();
        // Set up ResizeObserver for responsive toolbar width
        const noteContainer = document.querySelector('.note-container');
        if (noteContainer) {
            resizeObserver = new ResizeObserver(() => {
                updateToolbarWidth();
            });
            resizeObserver.observe(noteContainer);
            updateToolbarWidth(); // Initial call
        }
    }, 100);
});
onUnmounted(() => {
    if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
    }
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
});
// Re-attach if container changes
watch(() => props.scrollContainer, () => {
    if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
    }
    scrollElement = attachScrollListener();
});
// Toolbar visibility from preferences
const showToolbar = computed(() => !preferencesStore.hideToolbar);
// Reactive toolbar width for responsive sizing
const toolbarMaxWidth = ref('900px');
let resizeObserver = null;
// Watch note container width and adjust toolbar
function updateToolbarWidth() {
    const noteContainer = document.querySelector('.note-container');
    if (!noteContainer)
        return;
    const containerWidth = noteContainer.offsetWidth;
    const horizontalPadding = 80; // 40px on each side
    const availableWidth = containerWidth - horizontalPadding;
    // Breakpoint system for button visibility
    if (availableWidth > 820) {
        toolbarMaxWidth.value = 'min(calc(100% - 80px), 900px)';
    }
    else if (availableWidth > 520) {
        toolbarMaxWidth.value = 'min(calc(100% - 80px), 700px)';
    }
    else if (availableWidth > 320) {
        toolbarMaxWidth.value = 'min(calc(100% - 60px), 500px)';
    }
    else {
        toolbarMaxWidth.value = 'calc(100% - 40px)';
    }
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['floating-toolbar-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-toolbar-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-toolbar-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-float-enter-active']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-float-leave-active']} */ ;
(__VLS_ctx.toolbarMaxWidth);
// @ts-ignore
[toolbarMaxWidth,];
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    name: "toolbar-float",
}));
const __VLS_2 = __VLS_1({
    name: "toolbar-float",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
if (__VLS_ctx.showToolbar) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onMouseenter: (...[$event]) => {
                if (!(__VLS_ctx.showToolbar))
                    return;
                __VLS_ctx.isHovered = true;
                // @ts-ignore
                [showToolbar, isHovered,];
            } },
        ...{ onMouseleave: (...[$event]) => {
                if (!(__VLS_ctx.showToolbar))
                    return;
                __VLS_ctx.isHovered = false;
                // @ts-ignore
                [isHovered,];
            } },
        ...{ class: "floating-toolbar-wrapper" },
        ...{ class: ({ hidden: !__VLS_ctx.isVisible }) },
    });
    /** @type {__VLS_StyleScopedClasses['floating-toolbar-wrapper']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "floating-toolbar" },
    });
    /** @type {__VLS_StyleScopedClasses['floating-toolbar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toolbar-group" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showToolbar))
                    return;
                __VLS_ctx.format('strong');
                // @ts-ignore
                [isVisible, format,];
            } },
        ...{ class: "toolbar-btn" },
        title: "Bold (⌘B)",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    let __VLS_6;
    /** @ts-ignore @type {typeof __VLS_components.Bold} */
    Bold;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_8 = __VLS_7({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showToolbar))
                    return;
                __VLS_ctx.format('em');
                // @ts-ignore
                [format,];
            } },
        ...{ class: "toolbar-btn" },
        title: "Italic (⌘I)",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    let __VLS_11;
    /** @ts-ignore @type {typeof __VLS_components.Italic} */
    Italic;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_13 = __VLS_12({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showToolbar))
                    return;
                __VLS_ctx.format('u');
                // @ts-ignore
                [format,];
            } },
        ...{ class: "toolbar-btn hide-on-small" },
        title: "Underline",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['hide-on-small']} */ ;
    let __VLS_16;
    /** @ts-ignore @type {typeof __VLS_components.Underline} */
    Underline;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_18 = __VLS_17({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showToolbar))
                    return;
                __VLS_ctx.format('del');
                // @ts-ignore
                [format,];
            } },
        ...{ class: "toolbar-btn hide-on-small" },
        title: "Strikethrough",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['hide-on-small']} */ ;
    let __VLS_21;
    /** @ts-ignore @type {typeof __VLS_components.Strikethrough} */
    Strikethrough;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_23 = __VLS_22({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "toolbar-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toolbar-group" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showToolbar))
                    return;
                __VLS_ctx.updateParagraph('heading 1');
                // @ts-ignore
                [updateParagraph,];
            } },
        ...{ class: "toolbar-btn" },
        title: "Heading 1",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    let __VLS_26;
    /** @ts-ignore @type {typeof __VLS_components.Heading1} */
    Heading1;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_28 = __VLS_27({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showToolbar))
                    return;
                __VLS_ctx.updateParagraph('heading 2');
                // @ts-ignore
                [updateParagraph,];
            } },
        ...{ class: "toolbar-btn" },
        title: "Heading 2",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    let __VLS_31;
    /** @ts-ignore @type {typeof __VLS_components.Heading2} */
    Heading2;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_33 = __VLS_32({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showToolbar))
                    return;
                __VLS_ctx.updateParagraph('heading 3');
                // @ts-ignore
                [updateParagraph,];
            } },
        ...{ class: "toolbar-btn hide-on-small" },
        title: "Heading 3",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['hide-on-small']} */ ;
    let __VLS_36;
    /** @ts-ignore @type {typeof __VLS_components.Heading3} */
    Heading3;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_38 = __VLS_37({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "toolbar-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toolbar-group" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showToolbar))
                    return;
                __VLS_ctx.updateParagraph('ul-bullet');
                // @ts-ignore
                [updateParagraph,];
            } },
        ...{ class: "toolbar-btn" },
        title: "Bullet List",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    let __VLS_41;
    /** @ts-ignore @type {typeof __VLS_components.List} */
    List;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_43 = __VLS_42({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showToolbar))
                    return;
                __VLS_ctx.updateParagraph('ol-order');
                // @ts-ignore
                [updateParagraph,];
            } },
        ...{ class: "toolbar-btn" },
        title: "Numbered List",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    let __VLS_46;
    /** @ts-ignore @type {typeof __VLS_components.ListOrdered} */
    ListOrdered;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_48 = __VLS_47({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.insertTaskList) },
        ...{ class: "toolbar-btn hide-on-minimal" },
        title: "Task List",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['hide-on-minimal']} */ ;
    let __VLS_51;
    /** @ts-ignore @type {typeof __VLS_components.CheckSquare} */
    CheckSquare;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_53 = __VLS_52({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showToolbar))
                    return;
                __VLS_ctx.updateParagraph('blockquote');
                // @ts-ignore
                [updateParagraph, insertTaskList,];
            } },
        ...{ class: "toolbar-btn hide-on-minimal" },
        title: "Quote",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['hide-on-minimal']} */ ;
    let __VLS_56;
    /** @ts-ignore @type {typeof __VLS_components.Quote} */
    Quote;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_58 = __VLS_57({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.insertCodeBlock) },
        ...{ class: "toolbar-btn hide-on-minimal" },
        title: "Code Block",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['hide-on-minimal']} */ ;
    let __VLS_61;
    /** @ts-ignore @type {typeof __VLS_components.Code} */
    Code;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_63 = __VLS_62({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "toolbar-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toolbar-group" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.insertImage) },
        ...{ class: "toolbar-btn hide-on-medium" },
        title: "Insert Image",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['hide-on-medium']} */ ;
    let __VLS_66;
    /** @ts-ignore @type {typeof __VLS_components.Image} */
    Image;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_68 = __VLS_67({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showToolbar))
                    return;
                __VLS_ctx.format('link');
                // @ts-ignore
                [format, insertCodeBlock, insertImage,];
            } },
        ...{ class: "toolbar-btn" },
        title: "Insert Link",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    let __VLS_71;
    /** @ts-ignore @type {typeof __VLS_components.Link2} */
    Link2;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_73 = __VLS_72({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.insertTable) },
        ...{ class: "toolbar-btn hide-on-medium" },
        title: "Insert Table",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['hide-on-medium']} */ ;
    let __VLS_76;
    /** @ts-ignore @type {typeof __VLS_components.Table2} */
    Table2;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
        size: (15),
        strokeWidth: (2.5),
    }));
    const __VLS_78 = __VLS_77({
        size: (15),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "toolbar-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.handleAI) },
        ...{ class: "toolbar-btn ai-btn" },
        title: "AI Assistant",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['ai-btn']} */ ;
    let __VLS_81;
    /** @ts-ignore @type {typeof __VLS_components.Sparkles} */
    Sparkles;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
        size: (14),
        strokeWidth: (2.5),
    }));
    const __VLS_83 = __VLS_82({
        size: (14),
        strokeWidth: (2.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
// @ts-ignore
[insertTable, handleAI,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
