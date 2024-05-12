<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <video
      :style="playerStyleObj"
      :class="{ 'video-border': VideoBorder }"
      v-if="show"
      v-bind:srcObject="stream"
      :controls="showVideoControl"
      autoplay
      muted
    ></video>
    <div class="control" v-if="showControl">
      <el-input v-model="url" placeholder="源流地址(rtmp/rtsp/hls/mp4....)" /><br />
      <el-button @click="Play" type="primary" :loading="isLoading">播放</el-button>
      <el-button @click="Stop" type="primary" :loading="isLoading">停止</el-button>
      <el-button @click="Switch" type="primary">切换到主画面</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SrsRtcPlayerAsync } from '@/assets/srs.sdk.js'
import { reactive, ref } from 'vue'
import { request } from '@/utils/request'
import mitt from '@/utils/mitt'
import { ElMessage } from 'element-plus'

const props = defineProps(['playerWidth', 'playerHeight', 'index'])

let VideoBorder = ref(false)
let showControl = ref(false)
let player = new SrsRtcPlayerAsync()
let stream = reactive(player.stream)
let show = ref(true)
let url = ref('')
let showVideoControl = ref(false)
let rtc_url = 'webrtc://localhost/live/'
let isLoading = ref(false)

let playerStyleObj = reactive({
  width: props.playerWidth + 'px',
  height: props.playerHeight + 'px'
})

function startPlayer(player: any, url: string) {
  player.play(url).catch(function (reason: any) {
    player.close()
    ElMessage.error(reason)
  })
}

if (props.index < 0) {
  rtc_url += 'main_channel'
  showVideoControl.value = true
  request({
    method: 'post',
    url: '/query_main_channel',
    data: {}
  }).then((res: any) => {
    if (res.preview_index > 0) {
      mitt.emit('currentPreivew', res.preview_index)
    }
  })
} else {
  mitt.on('currentPreivew', (val) => {
    if (val == props.index) {
      VideoBorder.value = true
    } else {
      VideoBorder.value = false
    }
  })
  showVideoControl.value = false
  showControl.value = true
  rtc_url += 'preview_channel_' + props.index
  request({
    method: 'post',
    url: '/query_preview_channel',
    data: { index: props.index }
  }).then((res: any) => {
    url.value = res.source_url
  })
}

startPlayer(player, rtc_url)

function Switch() {
  request({
    method: 'post',
    url: '/switch_channel',
    data: { index: props.index }
  }).then(() => {
    mitt.emit('currentPreivew', props.index)
  })
}

function Stop() {
  isLoading.value = true
  request({
    method: 'post',
    url: '/stop_preview_channel',
    data: { index: props.index }
  })
    .then(() => {
      isLoading.value = false
    })
    .catch(() => {
      isLoading.value = false
    })
}

function Play() {
  show.value = false
  isLoading.value = true
  request({
    method: 'post',
    url: '/create_preview_channel',
    data: { index: props.index, source_url: url.value }
  })
    .then(() => {
      isLoading.value = false
    })
    .catch(() => {
      isLoading.value = false
    })
  player = new SrsRtcPlayerAsync()
  stream = player.stream
  show.value = true
  startPlayer(player, rtc_url)
}
</script>

<style scoped>
video {
  display: block;
  background-color: #888;
}
.video-border {
  border: 2px solid red;
}
</style>
