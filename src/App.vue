<template>
  <div>
    <div v-if='selectedHandle'>
      <label>Time <input type='number' v-model='selectedHandle.t' step='0.01'/></label>
      <!-- <div>t: {{ selectedHandle.t.toFixed(2) }}</div> -->
      <label>Value <input type='number' v-model='selectedHandle.value'/></label>
      <label>
        Easing function
        <select v-model='selectedHandle.easingFunction'>
          <option v-for='(easingFunction, index) in easingFunctions' :key='index' :value='easingFunction.func'>{{ easingFunction.name }}</option>
        </select>
      </label>
    </div>
  </div>
  <div>
    <input type='button' value='Play' @click='play'>
    <input type='button' value='Pause' @click='pause'>
    <input type='button' value='Stop' @click='stop'>
  </div>
  <div id='objectContainer'>
    <div id='object' ref='object'></div>
  </div>
  <div id="playHead" :style="{ left: playHeadPosition + 'px' }">
  </div>
  <svg ref='svg' preserveAspectRatio='none' height='100' viewBox='0 0 1000 1000'
    @dblclick='doubleClicked'>
    <!-- <g>
      <text x='0' y='0'>Hello</text>
    </g> -->
    <g>
      <rect v-for='(handle, index) in handles' :key='index' :x='handle.t * 990' width='10' :height='1000' style='fill:rgb(0,0,255);stroke-width:1;stroke:rgb(0,0,0)'
        @mousedown='handleMouseDown(handle)'
        @click='selectHandle(handle)'/>
    </g>
  </svg>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const easingFunctions = {
  none: { name: 'Linear', func: t => t },
  easeIn: { name: 'EaseIn', func: t => t * t },
  easeOut: { name: 'EaseOut', func: t => 1 - (1 - t) * (1 - t) },
  easeInOut: { name: 'EaseInOut', func: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 },
}

class Handle {
  constructor(t, value) {
    this.t = t;
    this.value = value || 0;
    this.easingFunction = easingFunctions.easeInOut.func;
  }
}

const svg = ref();
let handles = reactive([
  new Handle(0),
  new Handle(0.5, 100),
  new Handle(1),
]);

const duration = 2;
const object = ref();
const selectedHandle = ref(null);
const playing = ref(false);
const currentTime = ref(0);
const playHeadPosition = computed(() => {
  if(!svg.value) return 0;
  return Math.max(0, currentTime.value * svg.value.getAttribute('width') - 10);
});

let lastTime = Date.now();
let dragging = null;
let animationFrame = null;

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

function advanceTime() {
  const dt = (Date.now() - lastTime) / 1000;
  currentTime.value += dt / duration;
  if(currentTime.value > 1) {
    currentTime.value = 0;
    stop();
    return;
  }
  lastTime = Date.now();

  let handle1 = handles[0];
  let handle2 = handles[1];
  for(let i = 1; i < handles.length-1; i++) {
    const nextHandle = handles[i];
    if(nextHandle.t > currentTime.value) {
      break;
    }
    handle1 = nextHandle;
    handle2 = handles[i+1];
  }

  const t = clamp((currentTime.value - handle1.t) / (handle2.t - handle1.t), 0, 1);
  const value = lerp(handle1.value, handle2.value, handle2.easingFunction(t));

  object.value.style.setProperty('bottom', `${value}px`);
  animationFrame = requestAnimationFrame(advanceTime);
}

function play() {
  playing.value = true;
  lastTime = Date.now();
  advanceTime();
}

function pause() {
  playing.value = false;
  cancelAnimationFrame(animationFrame);
}

function stop() {
  pause();
  currentTime.value = 0;
}

function getT(mouseX) {
  if(!svg.value) return;
  const svgWidth = parseInt(svg.value.getAttribute('width'));
  const x = (mouseX / svgWidth) * 1000;
  return Math.min(1000 - 10, Math.max(0, x - 5)) / (1000 - 10);
}

function doubleClicked(ev) {
  handles.push(new Handle(getT(ev.offsetX)));
}

function handleMouseDown(s) {
  dragging = s;
}

function mouseMove(ev) {
  if(!svg.value) return;

  if(dragging) {
    dragging.t = getT(ev.offsetX);
    // Sort handles by t value
    handles.sort((a, b) => a.t - b.t);
  }
}

function mouseUp(ev) {
  dragging = null;
}

function selectHandle(handle) {
  selectedHandle.value = handle;
}

onMounted(() => {
  window.addEventListener('mouseup', mouseUp);
  window.addEventListener('mousemove', mouseMove);
  const svgV = svg.value;
  window.addEventListener('resize', () => {
    svgV.setAttribute('width', document.body.clientWidth);
  });
  svgV.setAttribute('width', document.body.clientWidth);
  // svgV.setAttribute('viewBox', `0 0 100 100`);
});
</script>
<style lang='scss'>
#app {
  display: grid;
  grid-template-rows: 100px 50px 1fr 15px 100px;
  width: 100vw;
  height: 100vh;
}
body {
  background: black;
  color: white;
  margin: 0;
  user-select: none;
}
canvas {
  outline: 10px solid white;
}
svg {
  background: white;
  rect:hover {
    cursor: col-resize;
  }
}
#objectContainer {
  display: flex;
  justify-content: center;
  align-items: center;
}
#playHead {
  position: relative;
  width: 0;
  height: 0;
  border: solid white;
  border-width: 0 3px 3px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
}
div#object {
  // position: absolute;
  // top: calc(50% - 50px);
  // left: calc(50% - 50px);
  position: relative;
  box-sizing: border-box;
  border: 5px solid red;
  width: 100px;
  height: 100px;
}
</style>
