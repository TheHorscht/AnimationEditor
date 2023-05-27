<template>
  <div id='objectContainer'>
    <div :style='{
      display: "flex",
      "justify-content": "center",
      "align-items": "flex-end",
      width: "400px",
      height: "400px",
      "border-bottom": "1px solid white",
    }'>
      <Box :x='object.x' :y='object.y' :scaleX='object.scaleX' :scaleY='object.scaleY' :rotation='object.rotation' @change='boxChanged'></Box>
    </div>
  </div>
  <div class='controls'>
    <div class='handleControls' v-if='selectedHandle'>
      <label>Time <input type='number' v-model='selectedHandle.t' step='0.01'/></label>
      <label>Value <input type='number' v-model='selectedHandle.value'/></label>
      <label>
        Easing function
        <select v-model='selectedHandle.easingFunction'>
          <option v-for='(easingFunction, index) in easingFunctions' :key='index' :value='easingFunction.func'>{{ easingFunction.name }}</option>
        </select>
      </label>
    </div>
  </div>
  <div class='controls'>
    <input type='button' value='Play' @click='play'>
    <input type='button' value='Pause' @click='pause'>
    <input type='button' value='Stop' @click='stop'>
  </div>
  <div id='playHead' :style='{ left: `${playHeadPosition}px` }' @mousedown='playHeadMouseDown'>
  </div>
  <div id='timeline'>
    <div>
      <div v-for='t in animationProperties' :key='t'>{{t}}</div>
    </div>
    <div>
      <Timeline v-for='(prop, index) in animationProperties' :ref='el => timelines[prop] = el' @handleSelected='handleSelected' @change="() => null" :selectedHandle='selectedHandle'></Timeline>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import Timeline from './components/Timeline.vue';
import Box from './components/Box.vue';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const easingFunctions = {
  none: { name: 'Linear', func: t => t },
  easeIn: { name: 'EaseIn', func: t => t * t },
  easeOut: { name: 'EaseOut', func: t => 1 - (1 - t) * (1 - t) },
  easeInOut: { name: 'EaseInOut', func: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 },
}

const animationProperties = ref([ 'x', 'y', 'scaleX', 'scaleY', 'rotation' ]);
const timelines = ref({});
const duration = 2;
// const object = ref();
const selectedHandle = ref(null);
let selectedProp = null;
const playing = ref(false);
let draggingPlayHead = false;
const currentTime = ref(0);
const object = reactive({
  x: 0,
  y: 0,
  scaleX: 0,
  scaleY: 0,
  rotation: 0,
});
let firstTimeline = ref(null);
const playHeadPosition = computed(() => {
  if(!firstTimeline.value) return 0;
  const bbox = firstTimeline.value.getBoundingClientRect();
  return Math.max(0, 110 + currentTime.value * (bbox.right - 110) - 10);
});
watch(playHeadPosition, () => {
  updateAnimation();
});
let lastTime = Date.now();
let animationFrame = null;

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

function updateAnimation() {
  for(const prop of animationProperties.value) {
    const timeline = timelines.value[prop];
    let handle1 = timeline.handles[0];
    let handle2 = timeline.handles[1];
    for(let i = 1; i < timeline.handles.length-1; i++) {
      const nextHandle = timeline.handles[i];
      if(nextHandle.t > currentTime.value) {
        break;
      }
      handle1 = nextHandle;
      handle2 = timeline.handles[i+1];
    }
  
    const t = clamp((currentTime.value - handle1.t) / (handle2.t - handle1.t), 0, 1);
    const value = lerp(handle1.value, handle2.value, handle2.easingFunction(t));
  
    object[prop] = value;
  }
}

function advanceTime() {
  const dt = (Date.now() - lastTime) / 1000;
  currentTime.value += dt / duration;
  if(currentTime.value >= 1) {
    currentTime.value = 0;
    stop();
    return;
  }
  lastTime = Date.now();
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

function handleSelected(handle) {
  selectedHandle.value = handle;
}

function playHeadMouseDown(ev) {
  draggingPlayHead = true;
}

function mouseUp(ev) {
  draggingPlayHead = false;
}

function mouseMove(ev) {
  if(draggingPlayHead && firstTimeline.value) {
    const bbox = firstTimeline.value.getBoundingClientRect();
    const playHeadWidth = 10;
    const x = clamp(ev.clientX, bbox.left + playHeadWidth/2, bbox.right - playHeadWidth/2) - bbox.left;
    currentTime.value = x / bbox.width;
  }
}

function boxChanged({ prop, value }) {
  object[prop] = value;
  // Get closest handle with the current prop value and change it's value
  const closestHandle = {
    handle: timelines.value[prop].handles[0],
    dist: Infinity
  };
  timelines.value[prop].handles.forEach(handle => {
    if(handle != closestHandle) {
      const dist = Math.abs(handle.t - currentTime.value);
      if(dist < closestHandle.dist) {
        closestHandle.handle = handle;
        closestHandle.dist = dist;
      }
    }
  });
  closestHandle.handle.value = value;
  closestHandle.handle.t = currentTime.value;
  selectedHandle.value = closestHandle.handle;
}

onMounted(() => {
  firstTimeline.value = document.querySelector('#timeline > div:nth-child(2)');
  window.addEventListener('mouseup', mouseUp);
  window.addEventListener('mousemove', mouseMove);
  timelines.value.scaleX.handles.forEach(handle => handle.value = 1);
  timelines.value.scaleY.handles.forEach(handle => handle.value = 1);
});
</script>

<style lang='scss'>
@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
#app {
  display: grid;
  font-family: 'Roboto', sans-serif;
  grid-template-rows: 1fr auto auto 15px 100px;
  width: 100vw;
  height: 100vh;
}
input[type="button"] {
  font-family: 'Roboto';
  padding: 5px 15px;
  margin: 0px 1px;
  cursor: pointer;
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
  display: block;
  height: 20px;
  background: white;
  outline: 1px solid black;
  width: 100%;
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
.controls {
  margin: auto;
  margin-top: 20px;
}
.handleControls > * {
  display: block;
}
div#object {
  position: relative;
  box-sizing: border-box;
  border: 5px solid red;
  width: 100px;
  height: 100px;
}
#timeline {
  display: grid;
  grid-template-columns: 100px auto;
  max-width: 100%;
  overflow: hidden;
  div:nth-child(1) > div {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-right: 6px;
    font-size: 17px;
    height: 20px;
  }
}
</style>
