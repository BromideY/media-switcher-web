<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <canvas id="canvas"></canvas>
</template>

<script setup lang="ts">
import { fabric } from 'fabric'
import { onMounted } from 'vue'

let canvas: fabric.Canvas

let wsAddr = 'ws://127.0.0.1:9002'

const ws = new WebSocket(wsAddr)

ws.onopen = function () {
  console.log(wsAddr + ' connected')
}

ws.onmessage = function (event) {
  if (event.data.canvas_width != undefined) {
    canvas.setWidth(event.data.canvas_width)
  }
  if (event.data.canvas_heigth != undefined) {
    canvas.setHeight(event.data.canvas_heigth)
  }
  if (event.data != undefined) {
    canvas.loadFromJSON(event.data, () => {
      canvas.renderAll()
    })
  }
}

onMounted(() => {
  canvas = new fabric.Canvas('canvas', {
    width: 1280,
    height: 720
  })
})
</script>

<style scoped></style>
