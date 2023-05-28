<template>
  <div id='transport' ref='transport' :style='{ height: `${props.height}px` }' @mousedown='mouseDown'>
    <span id='playHead' :style='{ left: `${handleWidth/4 + t * (width - handleWidth) + 1}px`}'></span>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import { clamp } from '@/utils';

const emit = defineEmits(['change']);
const props = defineProps({
  height: { type: Number, default: 30 },
  handleWidth: { type: Number, default: 20 },
  t: { type: Number, default: 0 }
});

const transport = ref(null);
const width = ref(0);

let draggingPlayHead = false;
function mouseDown(ev) {
  draggingPlayHead = true;
}

function mouseMove(ev) {
  if(draggingPlayHead) {
    const bbox = transport.value.getBoundingClientRect();
    // const x = clamp(ev.clientX, bbox.left, bbox.right) - bbox.left;
    const x = clamp(ev.clientX, bbox.left + props.handleWidth/2, bbox.right - props.handleWidth/2) - bbox.left;
    emit('change', { t: (x - props.handleWidth/2) / (bbox.width - props.handleWidth) });
    // emit('change', { t: x / bbox.width });
  }
}

function mouseUp(ev) {
  draggingPlayHead = false;
}

onMounted(() => {
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', mouseUp);
  width.value = transport.value.getBoundingClientRect().width;
});

</script>

<style lang="scss" scoped>
#transport {
  background: rgb(53 53 177);
  overflow: hidden;
}
#playHead {
  position: relative;
  width: 0;
  height: 0;
  top: 8px;
  border: solid white;
  border-width: 0 3px 3px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
}
</style>
