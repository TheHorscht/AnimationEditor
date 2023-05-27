<template>
  <div ref='timeline' class='timeline' :style='{
    height: `${height-1}px`,
    border: "0.5px solid black"
    }'
    @dblclick='doubleClicked'
    @contextmenu.prevent>
    <span :class='{ handle: true, "handle-active": props.selectedHandle == handle }' v-for='(handle, index) in handles' :key='index'
      :style='{
        width: `${handleWidth}px`,
        height: `${height-1}px`,
        left: handle.t * (width - handleWidth) + "px"
      }'
      @mousedown.left='handleMouseDown(handle)'
      @contextmenu.prevent='removeHandle(handle)'>
    </span>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue';

class Handle {
  constructor(t, value) {
    this.t = t;
    this.value = value || 0;
    this.easingFunction = easingFunctions.easeInOut.func;
  }
}

const emit = defineEmits(['change', 'handleSelected']);
const props = defineProps({
  height: { type: Number, default: 20 },
  handleWidth: { type: Number, default: 20, },
  selectedHandle: { default: null }
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const easingFunctions = {
  none: { name: 'Linear', func: t => t },
  easeIn: { name: 'EaseIn', func: t => t * t },
  easeOut: { name: 'EaseOut', func: t => 1 - (1 - t) * (1 - t) },
  easeInOut: { name: 'EaseInOut', func: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 },
}

const width = ref(0);
// const width = computed(() => {
//   if(!timeline.value) return 0;
//   const bbox = timeline.value.getBoundingClientRect();
//   return bbox.width;
// });

const draggingHandle = ref(null);
let timeline = ref();
const handles = reactive([
  new Handle(0.0, 0),
  new Handle(0.5, 0),
  new Handle(1.0, 0),
]);

defineExpose({ handles });

function getT(mouseX) {
  if(!timeline.value) return 0;
  const bbox = timeline.value.getBoundingClientRect();
  const x = clamp(mouseX, bbox.left + props.handleWidth/2, bbox.right - props.handleWidth/2) - bbox.left;
  return (x - props.handleWidth/2) / (bbox.width - props.handleWidth);
}

function mouseMove(ev) {
  if(!timeline.value) return;
  if(draggingHandle.value) {
    const bbox = timeline.value.getBoundingClientRect();
    const x = clamp(ev.clientX, bbox.left + props.handleWidth/2, bbox.right - props.handleWidth/2) - bbox.left;
    draggingHandle.value.t = (x - props.handleWidth/2) / (bbox.width - props.handleWidth);
    // Sort handles by t value
    handles.sort((a, b) => a.t - b.t);
    emit('change', handles);
  }
}

function mouseUp() {
  draggingHandle.value = null;
}

function doubleClicked(ev) {
  handles.push(new Handle(getT(ev.clientX)));
  handles.sort((a, b) => a.t - b.t);
  emit('change', handles);
}

onMounted(() => {
  function updateWidth() {
    if(!timeline.value) return;
    const bbox = timeline.value.getBoundingClientRect();
    width.value = bbox.width;
  }
  updateWidth();
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', mouseUp);
  window.addEventListener('resize', updateWidth);
});

function handleMouseDown(handle) {
  // selectedHandle.value = handle;
  draggingHandle.value = handle;
  emit('handleSelected', handle);
}
function removeHandle(handle) {
  handles.splice(handles.indexOf(handle), 1);
  emit('changed', handles);
}
</script>

<style lang="scss" scoped>
.timeline {
  position: relative;
  background: white;
}
.handle {
  display: inline-block;
  position: absolute;
  box-sizing: border-box;
  border: 1px solid #214154;
  cursor: col-resize;
  background: #3b51a1;
  &-active {
    background: red;
  }
}
</style>
