<template>
  <div>
    <video ref="video" controls autoplay :style="playerStyleObj"></video>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import Hls from 'hls.js'
import mitt from '@/utils/mitt'

const props = defineProps(['playerWidth', 'playerHeight'])
let playerStyleObj = reactive({
  width: props.playerWidth + 'px',
  height: props.playerHeight + 'px'
})
let src = ref('')
const video = ref()
let hls: Hls

mitt.on('SetHlsUrl', (e) => {
  src.value = e as string
})

function StartPlay() {
  hls = new Hls()
  hls.loadSource(src.value)
  hls.attachMedia(video.value)
  hls.on(Hls.Events.MANIFEST_PARSED, function () {
    video.value.play()
  })
}
function StopPlay() {
  hls.stopLoad()
  hls.destroy()
}

defineExpose({ StartPlay, StopPlay })
</script>

<style scoped>
video {
  background-color: #888;
}
</style>
