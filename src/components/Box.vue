<template>
  <div class='box' ref='box' :style='style'>
    <!-- Scale handles -->
    <div class='handle left' @mousedown='startDrag($event, directions.left)' :style='{ height: `${props.height * props.scaleY}px` }'></div>
    <div class='handle top' @mousedown='startDrag($event, directions.top)' :style='{ width: `${props.width * props.scaleX}px` }'></div>
    <div class='handle right' @mousedown='startDrag($event, directions.right)' :style='{ height: `${props.height * props.scaleY}px` }'></div>
    <div class='handle bottom' @mousedown='startDrag($event, directions.bottom)' :style='{ width: `${props.width * props.scaleX}px` }'></div>
    <div class='handle translateX' @mousedown='startDrag($event, directions.translateX)' :style='{ right: "-60px", top: "calc(50% - 7px)" }'></div>
    <div class='handle translateY' @mousedown='startDrag($event, directions.translateY)' :style='{ left: "calc(50% - 7px)", top: "-60px" }'></div>
  </div>
</template>

<script setup>
import { exportDefaultSpecifier } from '@babel/types';
import { ref, reactive, computed, onMounted, toRefs } from 'vue';

const directions = Object.freeze({
  left: 1,
  top: 2,
  right: 3,
  bottom: 4,
  translateX: 5,
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

const origin = { x: null, y: null };
const startPos = { x: 0, y: 0 };
const startValue = { x: 0, y: 0 };
const box = ref(null);
let draggingDirection = null;

function startDrag(ev, direction) {
  draggingDirection = direction;
  startPos.x = ev.clientX;
  startPos.y = ev.clientY;
  startValue.x = props.x;
  startValue.y = props.y;
}

const emit = defineEmits(['change']);
const scaleFuncs = {
  [directions.left]: (x, y, center) => emit('change', { prop: 'scaleX', value: (center.x - x) / props.width * 2 }),
  [directions.top]: (x, y, center, bottom) => emit('change', { prop: 'scaleY', value: (bottom - y) / props.height }),
  [directions.right]: (x, y, center) => emit('change', { prop: 'scaleX', value: (x - center.x) / props.width * 2 }),
  // [directions.bottom]: (x, y, center) => emit('change', { prop: 'scaleY', value: (y - center.y) / props.height * 2 }),
};
const translateFuncs = {
  [directions.translateX]: (x, y, center) => emit('change', { prop: 'x', value: startValue.x + (x - startPos.x) }),
  [directions.translateY]: (x, y, center) => emit('change', { prop: 'y', value: startValue.y + (startPos.y - y) }),
};
function mouseMove(ev) {
  // console.log(draggingDirection);
  if(scaleFuncs[draggingDirection]) {
    /** @type {DOMRect} */
    const bbox = box.value.getBoundingClientRect();
    const center = {
      x: bbox.left + (bbox.right - bbox.left) / 2,
      y: bbox.top + (bbox.bottom - bbox.top) / 2
    };
    scaleFuncs[draggingDirection](ev.clientX, ev.clientY, center, bbox.bottom);
  } else if(translateFuncs[draggingDirection]) {
    /** @type {DOMRect} */
    translateFuncs[draggingDirection](ev.clientX, ev.clientY, origin);

  }
}

function mouseUp(ev) {
  draggingDirection = null;
}

onMounted(() => {
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', mouseUp);
  const bbox = box.value.getBoundingClientRect();
  origin.x = bbox.left + (bbox.right - bbox.left) / 2;
  origin.y = bbox.top + (bbox.bottom - bbox.top) / 2;
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
.translateX {
  height: 11px;
  width: 50px;
  &::before {
    content: '';
    position: absolute;
    display: block;
    height: 5px;
    width: 5px;
    top: 2px;
    right: -1px;
    border-top: 2px solid red;
    border-right: 2px solid red;
    border-radius: 2px;
    transform: rotate(45deg);
  }
  &::after {
    content: '';
    position: relative;
    display: block;
    height: 1px;
    top: 5px;
    background-color: red;
  }
}
.translateY {
  height: 50px;
  width: 11px;
  // Arrow
  &::before {
    content: '';
    position: absolute;
    display: block;
    height: 5px;
    width: 5px;
    left: 2px;
    border-top: 2px solid red;
    border-left: 2px solid red;
    border-radius: 2px;
    transform: rotate(45deg);
  }
  // Handle
  &::after {
    content: ' ';
    display: inline-block;
    position: relative;
    display: block;
    width: 1px;
    height: 100%;
    left: 5px;
    background-color: red;
  }
}
</style>
