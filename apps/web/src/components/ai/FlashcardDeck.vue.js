import { ref, computed } from 'vue';
const props = defineProps({
    deck: {
        type: Object,
        required: true,
    },
});
const emit = defineEmits();
// State
const currentIndex = ref(0);
const flipped = ref(false);
const shuffled = ref(false);
const knownCards = ref(new Set());
const reviewCards = ref(new Set());
// Computed
const cards = computed(() => {
    if (!shuffled.value)
        return props.deck.cards;
    return [...props.deck.cards].sort(() => Math.random() - 0.5);
});
const currentCard = computed(() => cards.value[currentIndex.value]);
const progress = computed(() => ({
    current: currentIndex.value + 1,
    total: cards.value.length,
    known: knownCards.value.size,
    review: reviewCards.value.size,
}));
const isComplete = computed(() => currentIndex.value >= cards.value.length);
const difficultyColor = computed(() => {
    const difficulty = currentCard.value?.difficulty;
    if (difficulty === 'easy')
        return '#10b981';
    if (difficulty === 'hard')
        return '#ef4444';
    return '#f59e0b';
});
// Methods
function flipCard() {
    flipped.value = !flipped.value;
}
function nextCard() {
    if (currentIndex.value < cards.value.length - 1) {
        currentIndex.value++;
        flipped.value = false;
    }
    else {
        // Session complete
        emit('complete', {
            known: knownCards.value.size,
            review: reviewCards.value.size,
            total: cards.value.length,
        });
    }
}
function prevCard() {
    if (currentIndex.value > 0) {
        currentIndex.value--;
        flipped.value = false;
    }
}
function markKnown() {
    if (!currentCard.value)
        return;
    knownCards.value.add(currentCard.value.id);
    reviewCards.value.delete(currentCard.value.id);
    nextCard();
}
function markReview() {
    if (!currentCard.value)
        return;
    reviewCards.value.add(currentCard.value.id);
    knownCards.value.delete(currentCard.value.id);
    nextCard();
}
function toggleShuffle() {
    shuffled.value = !shuffled.value;
    restart();
}
function restart() {
    currentIndex.value = 0;
    flipped.value = false;
    knownCards.value.clear();
    reviewCards.value.clear();
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['deck-header']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['complete-state']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['known']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['review']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['restart-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flashcard-deck" },
});
/** @type {__VLS_StyleScopedClasses['flashcard-deck']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "deck-header" },
});
/** @type {__VLS_StyleScopedClasses['deck-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
(__VLS_ctx.deck.title);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "deck-controls" },
});
/** @type {__VLS_StyleScopedClasses['deck-controls']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.toggleShuffle) },
    ...{ class: ({ active: __VLS_ctx.shuffled }) },
    title: "Shuffle",
});
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.restart) },
    title: "Restart",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "progress-bar" },
});
/** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "progress-fill" },
    ...{ style: ({ width: `${(__VLS_ctx.progress.current / __VLS_ctx.progress.total) * 100}%` }) },
});
/** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "progress-text" },
});
/** @type {__VLS_StyleScopedClasses['progress-text']} */ ;
(__VLS_ctx.progress.current);
(__VLS_ctx.progress.total);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stats" },
});
/** @type {__VLS_StyleScopedClasses['stats']} */ ;
(__VLS_ctx.progress.known);
(__VLS_ctx.progress.review);
if (!__VLS_ctx.isComplete && __VLS_ctx.currentCard) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.flipCard) },
        ...{ class: "card-container" },
    });
    /** @type {__VLS_StyleScopedClasses['card-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card" },
        ...{ class: ({ flipped: __VLS_ctx.flipped }) },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    /** @type {__VLS_StyleScopedClasses['flipped']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-face front" },
    });
    /** @type {__VLS_StyleScopedClasses['card-face']} */ ;
    /** @type {__VLS_StyleScopedClasses['front']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "difficulty-badge" },
        ...{ style: ({ backgroundColor: __VLS_ctx.difficultyColor }) },
    });
    /** @type {__VLS_StyleScopedClasses['difficulty-badge']} */ ;
    (__VLS_ctx.currentCard.difficulty);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "card-content" },
    });
    /** @type {__VLS_StyleScopedClasses['card-content']} */ ;
    (__VLS_ctx.currentCard.front);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "hint" },
    });
    /** @type {__VLS_StyleScopedClasses['hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-face back" },
    });
    /** @type {__VLS_StyleScopedClasses['card-face']} */ ;
    /** @type {__VLS_StyleScopedClasses['back']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "card-content" },
    });
    /** @type {__VLS_StyleScopedClasses['card-content']} */ ;
    (__VLS_ctx.currentCard.back);
    if (__VLS_ctx.currentCard.tags.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "tags" },
        });
        /** @type {__VLS_StyleScopedClasses['tags']} */ ;
        for (const [tag] of __VLS_vFor((__VLS_ctx.currentCard.tags))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (tag),
                ...{ class: "tag" },
            });
            /** @type {__VLS_StyleScopedClasses['tag']} */ ;
            (tag);
            // @ts-ignore
            [deck, toggleShuffle, shuffled, restart, progress, progress, progress, progress, progress, progress, isComplete, currentCard, currentCard, currentCard, currentCard, currentCard, currentCard, flipCard, flipped, difficultyColor,];
        }
    }
}
else if (__VLS_ctx.isComplete) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "complete-state" },
    });
    /** @type {__VLS_StyleScopedClasses['complete-state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "complete-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['complete-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "final-stats" },
    });
    /** @type {__VLS_StyleScopedClasses['final-stats']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat known" },
    });
    /** @type {__VLS_StyleScopedClasses['stat']} */ ;
    /** @type {__VLS_StyleScopedClasses['known']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.progress.known);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat review" },
    });
    /** @type {__VLS_StyleScopedClasses['stat']} */ ;
    /** @type {__VLS_StyleScopedClasses['review']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.progress.review);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.restart) },
        ...{ class: "restart-btn" },
    });
    /** @type {__VLS_StyleScopedClasses['restart-btn']} */ ;
}
if (!__VLS_ctx.isComplete) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.prevCard) },
        ...{ class: "nav-btn" },
        disabled: (__VLS_ctx.currentIndex === 0),
    });
    /** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.markReview) },
        ...{ class: "action-btn review" },
    });
    /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['review']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.markKnown) },
        ...{ class: "action-btn known" },
    });
    /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['known']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.nextCard) },
        ...{ class: "nav-btn" },
    });
    /** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
}
// @ts-ignore
[restart, progress, progress, isComplete, isComplete, prevCard, currentIndex, markReview, markKnown, nextCard,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    props: {
        deck: {
            type: Object,
            required: true,
        },
    },
});
export default {};
