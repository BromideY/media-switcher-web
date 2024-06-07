<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <canvas id="canvas"></canvas>
</template>

<script setup lang="ts">
import { fabric } from 'fabric'

let canvas: fabric.Canvas

let wsAddr = 'ws://' + window.location.host + '/Scene'

const ws = new WebSocket(wsAddr)

ws.onopen = function () {
  console.log(wsAddr + ' connected')
}

ws.onmessage = function (event) {
  let wsMessage = JSON.parse(event.data)
  if (wsMessage.canvas_width != undefined && wsMessage.canvas_height != undefined) {
    canvas = new fabric.Canvas('canvas', {
      width: wsMessage.canvas_width,
      height: wsMessage.canvas_height
    })
  }
  if (event.data != undefined) {
    canvas.loadFromJSON(wsMessage, () => {
      canvas.renderAll()
    })
  }
}
</script>
