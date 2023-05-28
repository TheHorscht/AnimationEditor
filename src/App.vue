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
      <label>Time <input type='number' v-model='selectedHandleT' step='0.01'/></label>
      <span>
        <label>Value <input type='number' v-model='selectedHandle.value'/></label>
        <input type="button" value="Reset" @click='selectedHandle.value = 0'>
      </span>
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
  <div id='timeline'>
    <div style='grid-row: 2;'>
      <div v-for='t in animationProperties' :key='t'>{{t}}</div>
    </div>
    <Transport :t='currentTime' @change='ev => currentTime = (console.log(ev.t), ev.t)' style='grid-column: 2;'></Transport>
    <div style='grid-column: 2; grid-row: 2; overflow: hidden;'>
      <Timeline v-for='(prop, index) in animationProperties' :ref='el => timelines[prop] = el' @handleSelected='handleSelected' @change="handleChanged" :selectedHandle='selectedHandle'></Timeline>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { clamp, easingFunctions } from '@/utils';
import Timeline from './components/Timeline.vue';
import Box from './components/Box.vue';
import Transport from './components/Transport.vue';

const animationProperties = ref([ 'x', 'y', 'scaleX', 'scaleY', 'rotation' ]);
const timelines = ref({});
const duration = 2;
const selectedHandle = ref(null);
let selectedProp = null;
const playing = ref(false);
const currentTime = ref(0);
const object = computed(() => {
  const object = {
    x: 0,
    y: 0,
    scaleX: 0,
    scaleY: 0,
    rotation: 0,
  };
  for(const prop of animationProperties.value) {
    const timeline = timelines.value[prop];
    if(!timeline) {
      return object;
    }
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
    object[prop] = lerp(handle1.value, handle2.value, handle2.easingFunction(t));
  }
  return object;
});
let firstTimeline = ref(null);
const selectedHandleT = computed({
  get: () => selectedHandle.value.t.toFixed(2),
  set: value => selectedHandle.value.t = value,
})
let lastTime = Date.now();
let animationFrame = null;

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
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
  currentTime.value = handle.t;
}

function handleChanged(handles) {
  currentTime.value = selectedHandle.value.t;
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
  timelines.value.scaleX.handles.forEach(handle => handle.value = 1);
  timelines.value.scaleY.handles.forEach(handle => handle.value = 1);
});
</script>

<style lang='scss'>
@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
#app {
  display: grid;
  font-family: 'Roboto', sans-serif;
  grid-template-rows: 1fr auto auto 30px 100px;
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
.controls {
  margin: 5px auto;
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
  // overflow: hidden;
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
