import { ref, computed } from 'vue';
import { useAIStore } from '@/stores/ai';
import { useAIChat } from '@/services/ai.service';
import { useEditorStore, useLayoutStore } from '@/stores';
import ChatMessage from './ChatMessage.vue';
import { Search, Minimize2, Plus, Loader2, Paperclip, Globe, AtSign, ArrowUp, FileText } from 'lucide-vue-next';
const __VLS_props = defineProps();
// Store and composable
const store = useAIStore();
const editorStore = useEditorStore();
const layoutStore = useLayoutStore();
const { sendMessage, isProcessing } = useAIChat();
const activeTab = ref('agent');
// Local state
const inputValue = ref('');
const searchQuery = ref('');
// Computed
const messages = computed(() => store.activeSession?.messages || []);
const activeNote = computed(() => editorStore.currentDocument);
// Quick Commands for Agent tab
const quickCommands = [
    { cmd: '/artifact', desc: 'Create live code' },
    { cmd: '/database', desc: 'Create table' },
    { cmd: '/tasks', desc: 'Create task list' },
    { cmd: '@NoteName', desc: 'Reference another note' }
];
// Recommendations for Recommend tab - matching Note3 design
const recommendations = [
    {
        id: 'mindmap',
        title: 'Generate Mindmap',
        badge: 'NEW',
        description: 'Visualize your study guide as an interactive mindmap. See connections between concepts and understand the big picture.',
        tags: ['Visual', 'Structure', 'Overview'],
        primaryAction: 'View',
        secondaryAction: 'Dismiss'
    },
    {
        id: 'advanced',
        title: 'Advanced Concepts',
        description: 'Explore advanced topics and related concepts. Each concept builds on your current understanding.',
        tags: ['Deep Dive', 'Learning', 'Theory'],
        primaryAction: 'View',
        secondaryAction: 'Dismiss'
    },
    {
        id: 'flashcards',
        title: 'Flashcards',
        description: 'Interactive flashcards to memorize key concepts and test your knowledge.',
        tags: ['Memory', 'Practice', 'Quiz'],
        primaryAction: 'Start',
        secondaryAction: 'Dismiss'
    }
];
const dismissedCards = ref(new Set());
const activeCard = ref(null);
function dismissCard(id) {
    dismissedCards.value.add(id);
}
const visibleRecommendations = computed(() => recommendations.filter(r => !dismissedCards.value.has(r.id)));
// Handle submit
async function handleSubmit() {
    if (!inputValue.value.trim() || isProcessing.value)
        return;
    const msg = inputValue.value;
    inputValue.value = '';
    await sendMessage(msg, 'secretary');
}
// Handle enter key
function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
}
// Close sidebar
function closeSidebar() {
    layoutStore.toggleRightPanel();
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
/** @type {__VLS_StyleScopedClasses['ai-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['new-chat-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['context-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['recommendation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['card-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-input-box']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['send-cirle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['send-cirle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
    ...{ class: "ai-sidebar" },
});
/** @type {__VLS_StyleScopedClasses['ai-sidebar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "sidebar-header" },
});
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "sidebar-tabs" },
});
/** @type {__VLS_StyleScopedClasses['sidebar-tabs']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'agent';
            // @ts-ignore
            [activeTab,];
        } },
    ...{ class: "tab-btn" },
    ...{ class: ({ active: __VLS_ctx.activeTab === 'agent' }) },
});
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'recommend';
            // @ts-ignore
            [activeTab, activeTab,];
        } },
    ...{ class: "tab-btn" },
    ...{ class: ({ active: __VLS_ctx.activeTab === 'recommend' }) },
});
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'settings';
            // @ts-ignore
            [activeTab, activeTab,];
        } },
    ...{ class: "tab-btn" },
    ...{ class: ({ active: __VLS_ctx.activeTab === 'settings' }) },
});
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.closeSidebar) },
    ...{ class: "expand-btn" },
    title: "Close",
});
/** @type {__VLS_StyleScopedClasses['expand-btn']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Minimize2} */
Minimize2;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    size: (14),
}));
const __VLS_2 = __VLS_1({
    size: (14),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
if (__VLS_ctx.activeTab === 'agent') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "tab-content" },
    });
    /** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "agent-search-row" },
    });
    /** @type {__VLS_StyleScopedClasses['agent-search-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "new-chat-btn" },
        title: "New Chat",
    });
    /** @type {__VLS_StyleScopedClasses['new-chat-btn']} */ ;
    let __VLS_5;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        size: (14),
    }));
    const __VLS_7 = __VLS_6({
        size: (14),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "search-input" },
    });
    /** @type {__VLS_StyleScopedClasses['search-input']} */ ;
    let __VLS_10;
    /** @ts-ignore @type {typeof __VLS_components.Search} */
    Search;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        size: (14),
    }));
    const __VLS_12 = __VLS_11({
        size: (14),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.searchQuery),
        type: "text",
        placeholder: "Search knowledge base...",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "messages-area" },
    });
    /** @type {__VLS_StyleScopedClasses['messages-area']} */ ;
    if (__VLS_ctx.messages.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "welcome-section" },
        });
        /** @type {__VLS_StyleScopedClasses['welcome-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "ai-label" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "welcome-text" },
        });
        /** @type {__VLS_StyleScopedClasses['welcome-text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "welcome-text" },
        });
        /** @type {__VLS_StyleScopedClasses['welcome-text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "quick-commands-box" },
        });
        /** @type {__VLS_StyleScopedClasses['quick-commands-box']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "commands-header" },
        });
        /** @type {__VLS_StyleScopedClasses['commands-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "commands-list" },
        });
        /** @type {__VLS_StyleScopedClasses['commands-list']} */ ;
        for (const [cmd] of __VLS_vFor((__VLS_ctx.quickCommands))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (cmd.cmd),
                ...{ class: "command-row" },
            });
            /** @type {__VLS_StyleScopedClasses['command-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({
                ...{ class: "command-code" },
            });
            /** @type {__VLS_StyleScopedClasses['command-code']} */ ;
            (cmd.cmd);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "command-desc" },
            });
            /** @type {__VLS_StyleScopedClasses['command-desc']} */ ;
            (cmd.desc);
            // @ts-ignore
            [activeTab, activeTab, closeSidebar, searchQuery, messages, quickCommands,];
        }
    }
    else {
        for (const [msg] of __VLS_vFor((__VLS_ctx.messages))) {
            const __VLS_15 = ChatMessage;
            // @ts-ignore
            const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
                key: (msg.id),
                message: (msg),
            }));
            const __VLS_17 = __VLS_16({
                key: (msg.id),
                message: (msg),
            }, ...__VLS_functionalComponentArgsRest(__VLS_16));
            // @ts-ignore
            [messages,];
        }
    }
    if (__VLS_ctx.isProcessing) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "loading-indicator" },
        });
        /** @type {__VLS_StyleScopedClasses['loading-indicator']} */ ;
        let __VLS_20;
        /** @ts-ignore @type {typeof __VLS_components.Loader2} */
        Loader2;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
            size: (14),
            ...{ class: "spin" },
        }));
        const __VLS_22 = __VLS_21({
            size: (14),
            ...{ class: "spin" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        /** @type {__VLS_StyleScopedClasses['spin']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
}
else if (__VLS_ctx.activeTab === 'recommend') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "tab-content recommend-tab" },
    });
    /** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
    /** @type {__VLS_StyleScopedClasses['recommend-tab']} */ ;
    if (!__VLS_ctx.activeNote) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "context-indicator" },
        });
        /** @type {__VLS_StyleScopedClasses['context-indicator']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "radio-dot" },
        });
        /** @type {__VLS_StyleScopedClasses['radio-dot']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "recommendations-list" },
    });
    /** @type {__VLS_StyleScopedClasses['recommendations-list']} */ ;
    for (const [rec] of __VLS_vFor((__VLS_ctx.visibleRecommendations))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (rec.id),
            ...{ class: "recommendation-card" },
        });
        /** @type {__VLS_StyleScopedClasses['recommendation-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-header" },
        });
        /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "card-title" },
        });
        /** @type {__VLS_StyleScopedClasses['card-title']} */ ;
        (rec.title);
        if (rec.badge) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "card-badge" },
                ...{ class: (rec.badge.toLowerCase()) },
            });
            /** @type {__VLS_StyleScopedClasses['card-badge']} */ ;
            (rec.badge);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "card-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['card-desc']} */ ;
        (rec.description);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-tags" },
        });
        /** @type {__VLS_StyleScopedClasses['card-tags']} */ ;
        for (const [tag] of __VLS_vFor((rec.tags))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (tag),
                ...{ class: "card-tag" },
            });
            /** @type {__VLS_StyleScopedClasses['card-tag']} */ ;
            (tag);
            // @ts-ignore
            [activeTab, isProcessing, activeNote, visibleRecommendations,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ class: "action-btn primary" },
        });
        /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['primary']} */ ;
        (rec.primaryAction);
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.activeTab === 'agent'))
                        return;
                    if (!(__VLS_ctx.activeTab === 'recommend'))
                        return;
                    __VLS_ctx.dismissCard(rec.id);
                    // @ts-ignore
                    [dismissCard,];
                } },
            ...{ class: "action-btn secondary" },
        });
        /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['secondary']} */ ;
        (rec.secondaryAction);
        // @ts-ignore
        [];
    }
}
else if (__VLS_ctx.activeTab === 'settings') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "tab-content" },
    });
    /** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-placeholder" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-placeholder']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ai-input-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['ai-input-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ai-input-box" },
});
/** @type {__VLS_StyleScopedClasses['ai-input-box']} */ ;
if (__VLS_ctx.activeNote) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-context" },
    });
    /** @type {__VLS_StyleScopedClasses['input-context']} */ ;
    let __VLS_25;
    /** @ts-ignore @type {typeof __VLS_components.FileText} */
    FileText;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        size: (12),
        ...{ class: "context-icon" },
    }));
    const __VLS_27 = __VLS_26({
        size: (12),
        ...{ class: "context-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    /** @type {__VLS_StyleScopedClasses['context-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "context-title" },
    });
    /** @type {__VLS_StyleScopedClasses['context-title']} */ ;
    (__VLS_ctx.activeNote.title);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "input-area" },
});
/** @type {__VLS_StyleScopedClasses['input-area']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
    ...{ onKeydown: (__VLS_ctx.handleKeydown) },
    value: (__VLS_ctx.inputValue),
    placeholder: (__VLS_ctx.activeNote ? 'Ask about this note... (@ to reference)' : 'What\'s on your mind?'),
    disabled: (__VLS_ctx.isProcessing),
    rows: "1",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "input-footer" },
});
/** @type {__VLS_StyleScopedClasses['input-footer']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "footer-left" },
});
/** @type {__VLS_StyleScopedClasses['footer-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ class: "footer-btn" },
    title: "Attach",
});
/** @type {__VLS_StyleScopedClasses['footer-btn']} */ ;
let __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.Paperclip} */
Paperclip;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    size: (14),
}));
const __VLS_32 = __VLS_31({
    size: (14),
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ class: "footer-btn labeled" },
});
/** @type {__VLS_StyleScopedClasses['footer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['labeled']} */ ;
let __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.Globe} */
Globe;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    size: (14),
}));
const __VLS_37 = __VLS_36({
    size: (14),
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ class: "footer-btn labeled" },
});
/** @type {__VLS_StyleScopedClasses['footer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['labeled']} */ ;
let __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.AtSign} */
AtSign;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    size: (14),
}));
const __VLS_42 = __VLS_41({
    size: (14),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleSubmit) },
    ...{ class: "send-cirle-btn" },
    ...{ class: ({ active: __VLS_ctx.inputValue.trim() }) },
    disabled: (!__VLS_ctx.inputValue.trim() || __VLS_ctx.isProcessing),
});
/** @type {__VLS_StyleScopedClasses['send-cirle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
if (!__VLS_ctx.isProcessing) {
    let __VLS_45;
    /** @ts-ignore @type {typeof __VLS_components.ArrowUp} */
    ArrowUp;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
        size: (16),
    }));
    const __VLS_47 = __VLS_46({
        size: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
}
else {
    let __VLS_50;
    /** @ts-ignore @type {typeof __VLS_components.Loader2} */
    Loader2;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
        size: (16),
        ...{ class: "spin" },
    }));
    const __VLS_52 = __VLS_51({
        size: (16),
        ...{ class: "spin" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    /** @type {__VLS_StyleScopedClasses['spin']} */ ;
}
// @ts-ignore
[activeTab, isProcessing, isProcessing, isProcessing, activeNote, activeNote, activeNote, handleKeydown, inputValue, inputValue, inputValue, handleSubmit,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
