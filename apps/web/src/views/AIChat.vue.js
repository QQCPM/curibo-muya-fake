import { ref, computed, nextTick, onMounted } from 'vue';
import { useAIStore } from '@/stores/ai';
import { useAIChat } from '@/services/ai.service';
import { useEditorStore } from '@/stores';
import ChatMessage from '@/components/ai/ChatMessage.vue';
import { ArrowUp, Paperclip, Globe, Mic, Zap, ChevronDown, Loader2, Brain, Code, Lightbulb } from 'lucide-vue-next';
// Store and composable
const store = useAIStore();
const editorStore = useEditorStore();
const { sendMessage, clearChat, isProcessing, error, clearError } = useAIChat();
// Local state
const inputValue = ref('');
const selectedModel = ref('gpt');
const isModelDropdownOpen = ref(false);
const messagesEndRef = ref(null);
const isRecommendationsExiting = ref(false);
// Computed
const messages = computed(() => store.activeSession?.messages || []);
const hasMessages = computed(() => messages.value.length > 0);
// Scroll to bottom on new messages
function scrollToBottom() {
    nextTick(() => {
        messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' });
    });
}
// Handle submit with animation
async function handleSubmit() {
    const value = inputValue.value.trim();
    if (!value || isProcessing.value)
        return;
    // Trigger exit animation if first message
    if (!hasMessages.value) {
        isRecommendationsExiting.value = true;
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    inputValue.value = '';
    scrollToBottom();
    await sendMessage(value, 'secretary');
    scrollToBottom();
}
// Handle enter key
function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
}
// Clear chat
function handleClearChat() {
    clearChat();
    isRecommendationsExiting.value = false;
}
// Model selection
function selectModel(model) {
    selectedModel.value = model;
    isModelDropdownOpen.value = false;
}
// 2x2 Recommendation cards matching Note3 exactly
const recommendations = [
    {
        id: 'vae',
        icon: Brain,
        title: 'Explain VAE vs DAG',
        description: 'Compare Variational Autoencoders and DAG models from your Deep Learning notes.',
        action: 'Compare'
    },
    {
        id: 'neural',
        icon: Lightbulb,
        title: 'Quiz on Neural Pathways',
        description: 'Test your understanding of synaptic plasticity from Neuroscience 2.',
        action: 'Start Quiz'
    },
    {
        id: 'quantum',
        icon: Zap,
        title: 'Quantum Gates Cheatsheet',
        description: 'Generate a quick reference for Hadamard, CNOT, and Pauli gates.',
        action: 'Generate'
    },
    {
        id: 'react',
        icon: Code,
        title: 'React Hooks Deep Dive',
        description: 'Explain useEffect cleanup and dependency arrays from your React notes.',
        action: 'Explain'
    }
];
function handleRecommendationClick(rec) {
    inputValue.value = `${rec.action}: ${rec.title}`;
}
onMounted(() => {
    setTimeout(() => {
        const textarea = document.querySelector('textarea');
        textarea?.focus();
    }, 100);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['recommendation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['recommendation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['recommendation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['recommendation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['model-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['model-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['model-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['model-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['model-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['model-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['error-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['recommendations-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['recommendation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['recommendation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['recommendation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['recommendation-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "starting-page" },
});
/** @type {__VLS_StyleScopedClasses['starting-page']} */ ;
if (__VLS_ctx.hasMessages) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "messages-area" },
    });
    /** @type {__VLS_StyleScopedClasses['messages-area']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "messages-container" },
    });
    /** @type {__VLS_StyleScopedClasses['messages-container']} */ ;
    for (const [msg] of __VLS_vFor((__VLS_ctx.messages))) {
        const __VLS_0 = ChatMessage;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            key: (msg.id),
            message: (msg),
        }));
        const __VLS_2 = __VLS_1({
            key: (msg.id),
            message: (msg),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        // @ts-ignore
        [hasMessages, messages,];
    }
    if (__VLS_ctx.isProcessing) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "loading-indicator" },
        });
        /** @type {__VLS_StyleScopedClasses['loading-indicator']} */ ;
        let __VLS_5;
        /** @ts-ignore @type {typeof __VLS_components.Loader2} */
        Loader2;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            size: (16),
            ...{ class: "spin" },
        }));
        const __VLS_7 = __VLS_6({
            size: (16),
            ...{ class: "spin" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        /** @type {__VLS_StyleScopedClasses['spin']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ref: "messagesEndRef",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-area" },
    });
    /** @type {__VLS_StyleScopedClasses['input-area']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['input-wrapper']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-input" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
        ...{ onKeydown: (__VLS_ctx.handleKeydown) },
        value: (__VLS_ctx.inputValue),
        placeholder: "Ask anything, or type '@' to add to a note...",
        disabled: (__VLS_ctx.isProcessing),
        rows: "1",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-toolbar" },
    });
    /** @type {__VLS_StyleScopedClasses['input-toolbar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toolbar-left" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-left']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ class: "toolbar-btn" },
        title: "Attach file",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    let __VLS_10;
    /** @ts-ignore @type {typeof __VLS_components.Paperclip} */
    Paperclip;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        size: (16),
    }));
    const __VLS_12 = __VLS_11({
        size: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ class: "toolbar-btn" },
        title: "Voice input",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    let __VLS_15;
    /** @ts-ignore @type {typeof __VLS_components.Mic} */
    Mic;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        size: (16),
    }));
    const __VLS_17 = __VLS_16({
        size: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "toolbar-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "model-selector" },
    });
    /** @type {__VLS_StyleScopedClasses['model-selector']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.hasMessages))
                    return;
                __VLS_ctx.isModelDropdownOpen = !__VLS_ctx.isModelDropdownOpen;
                // @ts-ignore
                [isProcessing, isProcessing, handleKeydown, inputValue, isModelDropdownOpen, isModelDropdownOpen,];
            } },
        ...{ class: "model-btn" },
    });
    /** @type {__VLS_StyleScopedClasses['model-btn']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "model-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['model-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.selectedModel === 'gpt' ? 'GPT-5.2' : 'Gemini');
    let __VLS_20;
    /** @ts-ignore @type {typeof __VLS_components.ChevronDown} */
    ChevronDown;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        size: (12),
        ...{ class: ({ rotated: __VLS_ctx.isModelDropdownOpen }) },
    }));
    const __VLS_22 = __VLS_21({
        size: (12),
        ...{ class: ({ rotated: __VLS_ctx.isModelDropdownOpen }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    /** @type {__VLS_StyleScopedClasses['rotated']} */ ;
    let __VLS_25;
    /** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
    Transition;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        name: "dropdown",
    }));
    const __VLS_27 = __VLS_26({
        name: "dropdown",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    const { default: __VLS_30 } = __VLS_28.slots;
    if (__VLS_ctx.isModelDropdownOpen) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "model-dropdown" },
        });
        /** @type {__VLS_StyleScopedClasses['model-dropdown']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.hasMessages))
                        return;
                    if (!(__VLS_ctx.isModelDropdownOpen))
                        return;
                    __VLS_ctx.selectModel('gpt');
                    // @ts-ignore
                    [isModelDropdownOpen, isModelDropdownOpen, selectedModel, selectModel,];
                } },
            ...{ class: ({ active: __VLS_ctx.selectedModel === 'gpt' }) },
        });
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.hasMessages))
                        return;
                    if (!(__VLS_ctx.isModelDropdownOpen))
                        return;
                    __VLS_ctx.selectModel('gemini');
                    // @ts-ignore
                    [selectedModel, selectModel,];
                } },
            ...{ class: ({ active: __VLS_ctx.selectedModel === 'gemini' }) },
        });
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
    }
    // @ts-ignore
    [selectedModel,];
    var __VLS_28;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ class: "toolbar-btn research" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['research']} */ ;
    let __VLS_31;
    /** @ts-ignore @type {typeof __VLS_components.Globe} */
    Globe;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        size: (14),
    }));
    const __VLS_33 = __VLS_32({
        size: (14),
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.handleSubmit) },
        ...{ class: "send-btn" },
        ...{ class: ({ active: __VLS_ctx.inputValue.trim() && !__VLS_ctx.isProcessing }) },
        disabled: (!__VLS_ctx.inputValue.trim() || __VLS_ctx.isProcessing),
    });
    /** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    if (__VLS_ctx.isProcessing) {
        let __VLS_36;
        /** @ts-ignore @type {typeof __VLS_components.Loader2} */
        Loader2;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
            size: (16),
            ...{ class: "spin" },
        }));
        const __VLS_38 = __VLS_37({
            size: (16),
            ...{ class: "spin" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        /** @type {__VLS_StyleScopedClasses['spin']} */ ;
    }
    else {
        let __VLS_41;
        /** @ts-ignore @type {typeof __VLS_components.ArrowUp} */
        ArrowUp;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
            size: (16),
        }));
        const __VLS_43 = __VLS_42({
            size: (16),
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    }
    if (__VLS_ctx.hasMessages) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.handleClearChat) },
            ...{ class: "clear-btn" },
        });
        /** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-state" },
        ...{ class: ({ exiting: __VLS_ctx.isRecommendationsExiting }) },
    });
    /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
    /** @type {__VLS_StyleScopedClasses['exiting']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "centered-content" },
    });
    /** @type {__VLS_StyleScopedClasses['centered-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "recommendations-section" },
    });
    /** @type {__VLS_StyleScopedClasses['recommendations-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "recommendations-header" },
    });
    /** @type {__VLS_StyleScopedClasses['recommendations-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        width: "14",
        height: "14",
        viewBox: "0 0 16 16",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M9.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM7.25 4a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75V4Z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "recommendations-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['recommendations-grid']} */ ;
    for (const [rec] of __VLS_vFor((__VLS_ctx.recommendations))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.hasMessages))
                        return;
                    __VLS_ctx.handleRecommendationClick(rec);
                    // @ts-ignore
                    [hasMessages, isProcessing, isProcessing, isProcessing, inputValue, inputValue, handleSubmit, handleClearChat, isRecommendationsExiting, recommendations, handleRecommendationClick,];
                } },
            key: (rec.id),
            ...{ class: "recommendation-card" },
        });
        /** @type {__VLS_StyleScopedClasses['recommendation-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-icon" },
        });
        /** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
        const __VLS_46 = (rec.icon);
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            size: (20),
        }));
        const __VLS_48 = __VLS_47({
            size: (20),
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "card-title" },
        });
        /** @type {__VLS_StyleScopedClasses['card-title']} */ ;
        (rec.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "card-description" },
        });
        /** @type {__VLS_StyleScopedClasses['card-description']} */ ;
        (rec.description);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "card-action" },
        });
        /** @type {__VLS_StyleScopedClasses['card-action']} */ ;
        (rec.action);
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-input" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
        ...{ onKeydown: (__VLS_ctx.handleKeydown) },
        value: (__VLS_ctx.inputValue),
        placeholder: "Ask anything, or type '@' to add to a note...",
        disabled: (__VLS_ctx.isProcessing),
        rows: "1",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-toolbar" },
    });
    /** @type {__VLS_StyleScopedClasses['input-toolbar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toolbar-left" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-left']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ class: "toolbar-btn" },
        title: "Attach file",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    let __VLS_51;
    /** @ts-ignore @type {typeof __VLS_components.Paperclip} */
    Paperclip;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
        size: (16),
    }));
    const __VLS_53 = __VLS_52({
        size: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ class: "toolbar-btn" },
        title: "Voice input",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    let __VLS_56;
    /** @ts-ignore @type {typeof __VLS_components.Mic} */
    Mic;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
        size: (16),
    }));
    const __VLS_58 = __VLS_57({
        size: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "toolbar-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "model-selector" },
    });
    /** @type {__VLS_StyleScopedClasses['model-selector']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.hasMessages))
                    return;
                __VLS_ctx.isModelDropdownOpen = !__VLS_ctx.isModelDropdownOpen;
                // @ts-ignore
                [isProcessing, handleKeydown, inputValue, isModelDropdownOpen, isModelDropdownOpen,];
            } },
        ...{ class: "model-btn" },
    });
    /** @type {__VLS_StyleScopedClasses['model-btn']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "model-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['model-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.selectedModel === 'gpt' ? 'GPT-5.2' : 'Gemini');
    let __VLS_61;
    /** @ts-ignore @type {typeof __VLS_components.ChevronDown} */
    ChevronDown;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
        size: (12),
        ...{ class: ({ rotated: __VLS_ctx.isModelDropdownOpen }) },
    }));
    const __VLS_63 = __VLS_62({
        size: (12),
        ...{ class: ({ rotated: __VLS_ctx.isModelDropdownOpen }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    /** @type {__VLS_StyleScopedClasses['rotated']} */ ;
    let __VLS_66;
    /** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
    Transition;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
        name: "dropdown",
    }));
    const __VLS_68 = __VLS_67({
        name: "dropdown",
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    const { default: __VLS_71 } = __VLS_69.slots;
    if (__VLS_ctx.isModelDropdownOpen) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "model-dropdown" },
        });
        /** @type {__VLS_StyleScopedClasses['model-dropdown']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.hasMessages))
                        return;
                    if (!(__VLS_ctx.isModelDropdownOpen))
                        return;
                    __VLS_ctx.selectModel('gpt');
                    // @ts-ignore
                    [isModelDropdownOpen, isModelDropdownOpen, selectedModel, selectModel,];
                } },
            ...{ class: ({ active: __VLS_ctx.selectedModel === 'gpt' }) },
        });
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.hasMessages))
                        return;
                    if (!(__VLS_ctx.isModelDropdownOpen))
                        return;
                    __VLS_ctx.selectModel('gemini');
                    // @ts-ignore
                    [selectedModel, selectModel,];
                } },
            ...{ class: ({ active: __VLS_ctx.selectedModel === 'gemini' }) },
        });
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
    }
    // @ts-ignore
    [selectedModel,];
    var __VLS_69;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ class: "toolbar-btn research" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['research']} */ ;
    let __VLS_72;
    /** @ts-ignore @type {typeof __VLS_components.Globe} */
    Globe;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        size: (14),
    }));
    const __VLS_74 = __VLS_73({
        size: (14),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.handleSubmit) },
        ...{ class: "send-btn" },
        ...{ class: ({ active: __VLS_ctx.inputValue.trim() && !__VLS_ctx.isProcessing }) },
        disabled: (!__VLS_ctx.inputValue.trim() || __VLS_ctx.isProcessing),
    });
    /** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    if (__VLS_ctx.isProcessing) {
        let __VLS_77;
        /** @ts-ignore @type {typeof __VLS_components.Loader2} */
        Loader2;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
            size: (16),
            ...{ class: "spin" },
        }));
        const __VLS_79 = __VLS_78({
            size: (16),
            ...{ class: "spin" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        /** @type {__VLS_StyleScopedClasses['spin']} */ ;
    }
    else {
        let __VLS_82;
        /** @ts-ignore @type {typeof __VLS_components.ArrowUp} */
        ArrowUp;
        // @ts-ignore
        const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
            size: (16),
        }));
        const __VLS_84 = __VLS_83({
            size: (16),
        }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    }
}
let __VLS_87;
/** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
    name: "slide-up",
}));
const __VLS_89 = __VLS_88({
    name: "slide-up",
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
const { default: __VLS_92 } = __VLS_90.slots;
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "error-banner" },
    });
    /** @type {__VLS_StyleScopedClasses['error-banner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.error);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.clearError) },
    });
}
// @ts-ignore
[isProcessing, isProcessing, isProcessing, inputValue, inputValue, handleSubmit, error, error, clearError,];
var __VLS_90;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
