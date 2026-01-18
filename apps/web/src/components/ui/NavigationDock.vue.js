import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useLayoutStore } from '@/stores';
import { FileText, LayoutGrid, Calendar, GraduationCap, PanelLeft, PanelRight, Home } from 'lucide-vue-next';
const router = useRouter();
const route = useRoute();
const layoutStore = useLayoutStore();
// Navigate helper
function navigate(path) {
    router.push(path);
}
// Check if route is active
const isActive = (path) => route.path === path;
const isNoteActive = computed(() => {
    return route.path === '/' || route.name === 'editor';
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['dock-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dock-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dock-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "nav-dock" },
});
/** @type {__VLS_StyleScopedClasses['nav-dock']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.layoutStore.toggleSidebar) },
    ...{ class: "dock-item toggle-btn" },
    ...{ class: ({ active: __VLS_ctx.layoutStore.sidebarVisible }) },
    title: "Toggle Sidebar (Cmd+B)",
});
/** @type {__VLS_StyleScopedClasses['dock-item']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.PanelLeft} */
PanelLeft;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    size: (18),
}));
const __VLS_2 = __VLS_1({
    size: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigate('/');
            // @ts-ignore
            [layoutStore, layoutStore, navigate,];
        } },
    ...{ class: "dock-item" },
    ...{ class: ({ active: __VLS_ctx.isNoteActive }) },
    title: "Notes",
});
/** @type {__VLS_StyleScopedClasses['dock-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
let __VLS_5;
/** @ts-ignore @type {typeof __VLS_components.FileText} */
FileText;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    size: (18),
}));
const __VLS_7 = __VLS_6({
    size: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigate('/ai');
            // @ts-ignore
            [navigate, isNoteActive,];
        } },
    ...{ class: "dock-item" },
    ...{ class: ({ active: __VLS_ctx.isActive('/ai') }) },
    title: "Dashboard",
});
/** @type {__VLS_StyleScopedClasses['dock-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
let __VLS_10;
/** @ts-ignore @type {typeof __VLS_components.LayoutGrid} */
LayoutGrid;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    size: (18),
}));
const __VLS_12 = __VLS_11({
    size: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigate('/calendar');
            // @ts-ignore
            [navigate, isActive,];
        } },
    ...{ class: "dock-item" },
    ...{ class: ({ active: __VLS_ctx.isActive('/calendar') }) },
    title: "Calendar",
});
/** @type {__VLS_StyleScopedClasses['dock-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
let __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.Calendar} */
Calendar;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    size: (18),
}));
const __VLS_17 = __VLS_16({
    size: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigate('/courses');
            // @ts-ignore
            [navigate, isActive,];
        } },
    ...{ class: "dock-item" },
    ...{ class: ({ active: __VLS_ctx.isActive('/courses') }) },
    title: "Courses",
});
/** @type {__VLS_StyleScopedClasses['dock-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.GraduationCap} */
GraduationCap;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    size: (18),
}));
const __VLS_22 = __VLS_21({
    size: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.layoutStore.toggleRightPanel) },
    ...{ class: "dock-item toggle-btn" },
    ...{ class: ({ active: __VLS_ctx.layoutStore.rightPanelVisible }) },
    title: "Toggle AI Sidebar (Cmd+J)",
});
/** @type {__VLS_StyleScopedClasses['dock-item']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.PanelRight} */
PanelRight;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    size: (18),
}));
const __VLS_27 = __VLS_26({
    size: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dock-divider" },
});
/** @type {__VLS_StyleScopedClasses['dock-divider']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigate('/home');
            // @ts-ignore
            [layoutStore, layoutStore, navigate, isActive,];
        } },
    ...{ class: "dock-item" },
    ...{ class: ({ active: __VLS_ctx.isActive('/home') }) },
    title: "Home",
});
/** @type {__VLS_StyleScopedClasses['dock-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
let __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.Home} */
Home;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    size: (18),
}));
const __VLS_32 = __VLS_31({
    size: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
// @ts-ignore
[isActive,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
