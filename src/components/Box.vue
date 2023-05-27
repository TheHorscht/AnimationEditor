<template>
  <div class='box' ref='box' :style='style'>
    <!-- Scale handles -->
    <div class='handle left' @mousedown='startDrag(directions.left)' :style='{ height: `${props.height * props.scaleY}px` }'></div>
    <div class='handle top' @mousedown='startDrag(directions.top)' :style='{ width: `${props.width * props.scaleX}px` }'></div>
    <div class='handle right' @mousedown='startDrag(directions.right)' :style='{ height: `${props.height * props.scaleY}px` }'></div>
    <div class='handle bottom' @mousedown='startDrag(directions.bottom)' :style='{ width: `${props.width * props.scaleX}px` }'></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, toRefs } from 'vue';

const directions = Object.freeze({
  left: 1,
  top: 2,
  right: 3,
  bottom: 4,
});

const props = defineProps({
  width: { type: Number, default: 100 },
  height: { type: Number, default: 100 },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  scaleX: { type: Number, default: 1 },
  scaleY: { type: Number, default: 1 },
  rotation: { type: Number, default: 0 },
});
const style = computed(() => ({
  position: 'relative',
  left: `${props.x}px`,
  bottom: `${props.y}px`,
  width: `${props.width * props.scaleX}px`,
  height: `${props.height * props.scaleY}px`,
  transform: `rotate(${props.rotation}deg)`,
}));

const box = ref(null);
let draggingDirection = null;
function startDrag(direction) {
  draggingDirection = direction;
}

const emit = defineEmits(['change']);
const funcs = {
  [directions.left]: (x, y, center) => emit('change', { prop: 'scaleX', value: (center.x - x) / props.width * 2 }),
  [directions.top]: (x, y, center, bottom) => emit('change', { prop: 'scaleY', value: (bottom - y) / props.height }),
  [directions.right]: (x, y, center) => emit('change', { prop: 'scaleX', value: (x - center.x) / props.width * 2 }),
  // [directions.bottom]: (x, y, center) => emit('change', { prop: 'scaleY', value: (y - center.y) / props.height * 2 }),
};
function mouseMove(ev) {
  // console.log(draggingDirection);
  if(draggingDirection) {
    /** @type {DOMRect} */
    const bbox = box.value.getBoundingClientRect();
    const center = {
      x: bbox.left + (bbox.right - bbox.left) / 2,
      y: bbox.top + (bbox.bottom - bbox.top) / 2
    };
    funcs[draggingDirection]?.(ev.clientX, ev.clientY, center, bbox.bottom);
  }
}

function mouseUp(ev) {
  draggingDirection = null;
}

onMounted(() => {
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', mouseUp);
});
</script>

<style lang='scss'>
.box {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  border: 1px solid red;
}
.handle {
  position: absolute;
  border: 1px solid blue;
}
.left, .right {
  width: 11px;
  height: 100px;
  top: -1px;
  &:hover {
    cursor: col-resize;
  }
}
.top, .bottom {
  width: 100px;
  height: 11px;
  left: -1px;
  &:hover {
    cursor: row-resize;
  }
}
.left {
  left: -7px;
}
.right {
  right: -7px;
}
.top {
  top: -7px;
}
.bottom {
  bottom: -7px;
}
</style>
