<template>
  <div class='box' :style='{
    position: "relative",
    left: `${x}px`,
    bottom: `${y}px`,
    width: `${width * scaleX}px`,
    height: `${height *scaleY}px`,
    transform: `rotate(${rotation}deg)`,
  }'>

  </div>
</template>

<script setup>
const props = defineProps({
  width: {
    type: Number, default: 100
  },
  height: {
    type: Number, default: 100
  },
  x: {
    type: Number, default: 0
  },
  y: {
    type: Number, default: 0
  },
  scaleX: {
    type: Number, default: 1
  },
  scaleY: {
    type: Number, default: 1
  },
  rotation: {
    type: Number, default: 0
  },
})
</script>

<style lang='scss'>
.box {
  display: inline-block;
  box-sizing: border-box;
  border: 1px solid red;
}
</style>
