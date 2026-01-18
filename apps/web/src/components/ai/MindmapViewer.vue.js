import { ref, computed } from 'vue';
const props = defineProps({
    mindmap: {
        type: Object,
        required: true,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
});
// Layout settings
const nodeWidth = 140;
const nodeHeight = 40;
const levelSpacing = 160;
const siblingSpacing = 60;
// State
const svgRef = ref(null);
const viewBox = ref({ x: -300, y: -50, width: 900, height: 500 });
const collapsedNodes = ref(new Set());
// Computed node positions
const positionedNodes = computed(() => {
    const nodes = props.mindmap.nodes;
    const positions = new Map();
    // Find root
    const root = nodes.find(n => n.type === 'root');
    if (!root)
        return [];
    positions.set(root.id, { x: 0, y: 200 });
    // Position by level
    const levels = [[], [], []];
    nodes.forEach(n => {
        if (n.type === 'branch')
            levels[1].push(n);
        else if (n.type === 'leaf')
            levels[2].push(n);
    });
    // Position branches
    const branchCount = levels[1].length;
    levels[1].forEach((node, i) => {
        const yOffset = (i - (branchCount - 1) / 2) * siblingSpacing;
        positions.set(node.id, { x: levelSpacing, y: 200 + yOffset });
    });
    // Position leaves
    levels[1].forEach((branch, branchIdx) => {
        const leaves = levels[2].filter(l => l.parentId === branch.id);
        const branchPos = positions.get(branch.id);
        leaves.forEach((leaf, i) => {
            const yOffset = (i - (leaves.length - 1) / 2) * (siblingSpacing * 0.7);
            positions.set(leaf.id, { x: branchPos.x + levelSpacing, y: branchPos.y + yOffset });
        });
    });
    return nodes.map(n => {
        const pos = positions.get(n.id);
        return {
            ...n,
            x: pos?.x ?? 0,
            y: pos?.y ?? 0,
            visible: !isCollapsed(n),
        };
    });
});
const visibleEdges = computed(() => {
    return props.mindmap.edges.filter(e => {
        const source = positionedNodes.value.find(n => n.id === e.source);
        const target = positionedNodes.value.find(n => n.id === e.target);
        return source?.visible && target?.visible;
    });
});
function isCollapsed(node) {
    if (node.type === 'root')
        return false;
    if (node.type === 'branch')
        return collapsedNodes.value.has('root');
    if (node.type === 'leaf' && node.parentId) {
        return collapsedNodes.value.has(node.parentId) || collapsedNodes.value.has('root');
    }
    return false;
}
function toggleCollapse(nodeId) {
    if (props.readonly)
        return;
    if (collapsedNodes.value.has(nodeId)) {
        collapsedNodes.value.delete(nodeId);
    }
    else {
        collapsedNodes.value.add(nodeId);
    }
}
function getNodePosition(nodeId) {
    return positionedNodes.value.find(n => n.id === nodeId);
}
function getEdgePath(edge) {
    const source = getNodePosition(edge.source);
    const target = getNodePosition(edge.target);
    if (!source || !target)
        return '';
    const x1 = (source.x || 0) + nodeWidth / 2;
    const y1 = source.y || 0;
    const x2 = target.x || 0;
    const y2 = target.y || 0;
    // Bezier curve
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
}
// Pan handlers
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0 });
function onMouseDown(e) {
    isPanning.value = true;
    panStart.value = { x: e.clientX, y: e.clientY };
}
function onMouseMove(e) {
    if (!isPanning.value)
        return;
    const dx = e.clientX - panStart.value.x;
    const dy = e.clientY - panStart.value.y;
    viewBox.value.x -= dx;
    viewBox.value.y -= dy;
    panStart.value = { x: e.clientX, y: e.clientY };
}
function onMouseUp() {
    isPanning.value = false;
}
function onWheel(e) {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 1.1 : 0.9;
    viewBox.value.width *= scale;
    viewBox.value.height *= scale;
}
function resetView() {
    viewBox.value = { x: -300, y: -50, width: 900, height: 500 };
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
/** @type {__VLS_StyleScopedClasses['mindmap-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['mindmap-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['mindmap-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['mindmap-node']} */ ;
/** @type {__VLS_StyleScopedClasses['mindmap-node']} */ ;
/** @type {__VLS_StyleScopedClasses['mindmap-node']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mindmap-viewer" },
});
/** @type {__VLS_StyleScopedClasses['mindmap-viewer']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mindmap-controls" },
});
/** @type {__VLS_StyleScopedClasses['mindmap-controls']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.resetView) },
    title: "Reset View",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "title" },
});
/** @type {__VLS_StyleScopedClasses['title']} */ ;
(__VLS_ctx.mindmap.title);
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    ...{ onMousedown: (__VLS_ctx.onMouseDown) },
    ...{ onMousemove: (__VLS_ctx.onMouseMove) },
    ...{ onMouseup: (__VLS_ctx.onMouseUp) },
    ...{ onMouseleave: (__VLS_ctx.onMouseUp) },
    ...{ onWheel: (__VLS_ctx.onWheel) },
    ref: "svgRef",
    viewBox: (`${__VLS_ctx.viewBox.x} ${__VLS_ctx.viewBox.y} ${__VLS_ctx.viewBox.width} ${__VLS_ctx.viewBox.height}`),
});
for (const [edge] of __VLS_vFor((__VLS_ctx.visibleEdges))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        key: (edge.id),
        d: (__VLS_ctx.getEdgePath(edge)),
        fill: "none",
        stroke: "#8b5cf6",
        'stroke-width': "2",
        opacity: "0.6",
    });
    // @ts-ignore
    [resetView, mindmap, onMouseDown, onMouseMove, onMouseUp, onMouseUp, onWheel, viewBox, viewBox, viewBox, viewBox, visibleEdges, getEdgePath,];
}
for (const [node] of __VLS_vFor((__VLS_ctx.positionedNodes.filter(n => n.visible)))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.g, __VLS_intrinsics.g)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleCollapse(node.id);
                // @ts-ignore
                [positionedNodes, toggleCollapse,];
            } },
        key: (node.id),
        transform: (`translate(${node.x}, ${node.y - __VLS_ctx.nodeHeight / 2})`),
        ...{ class: "mindmap-node" },
        ...{ class: (node.type) },
    });
    /** @type {__VLS_StyleScopedClasses['mindmap-node']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
        width: (__VLS_ctx.nodeWidth),
        height: (__VLS_ctx.nodeHeight),
        rx: (node.type === 'root' ? 20 : 8),
        fill: (node.color || '#6366f1'),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
        x: (__VLS_ctx.nodeWidth / 2),
        y: (__VLS_ctx.nodeHeight / 2 + 4),
        'text-anchor': "middle",
        fill: "white",
        'font-size': "12",
        'font-weight': "500",
    });
    (node.label.slice(0, 16));
    (node.label.length > 16 ? '...' : '');
    // @ts-ignore
    [nodeHeight, nodeHeight, nodeHeight, nodeWidth, nodeWidth,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        mindmap: {
            type: Object,
            required: true,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
});
export default {};
