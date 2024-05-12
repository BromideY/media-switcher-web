<template>
  <video ref="video" controls autoplay :style="playerStyleObj"></video>
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
let hls = new Hls()

mitt.on('SetHlsUrl', (e) => {
  src.value = e as string
})

function StartPlay() {
  hls.loadSource(src.value)
  hls.attachMedia(video.value)
  hls.on(Hls.Events.MANIFEST_PARSED, function () {
    video.value.play()
  })
}
defineExpose({ StartPlay })
</script>

<style scoped>
video {
  width: 640px;
  height: 360px;
  background-color: #888;
}
</style>
