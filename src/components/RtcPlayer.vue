<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <video
      :style="playerStyleObj"
      :class="{ 'pgm-border': PGMBorder, 'pvw-border': PVWBorder }"
      v-if="show"
      v-bind:srcObject="stream"
      :controls="showVideoControl"
      autoplay
      muted
    ></video>
    <div v-if="showInputControl">
      <el-input
        v-model="source_url"
        clearable
        placeholder="源流地址(rtmp/rtsp/hls/mp4....)"
      /><br />
      <el-button @click="Play" type="primary" size="small" :loading="playStopLoading"
        >播放</el-button
      >
      <el-button @click="Stop" type="primary" size="small" :loading="playStopLoading"
        >停止</el-button
      >
      <el-button @click="Switch2PVW" type="primary" size="small" :loading="switchLoading"
        >上PVW</el-button
      >
      <el-button @click="Switch2PGM" type="primary" size="small" :loading="switchLoading"
        >上PGM</el-button
      >
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

let PVWBorder = ref(false)
let PGMBorder = ref(false)
let showInputControl = ref(false)
let player = new SrsRtcPlayerAsync()
let stream = reactive(player.stream)
let show = ref(true)
let source_url = ref('')
let showVideoControl = ref(false)
let rtc_url = 'webrtc://' + window.location.hostname + '/live/'
let playStopLoading = ref(false)
let switchLoading = ref(false)

let playerStyleObj = reactive({
  width: props.playerWidth + 'px',
  height: props.playerHeight + 'px'
})

if (props.index < 0) {
  showVideoControl.value = true
  if (props.index == -1) {
    request({
      method: 'post',
      url: '/query_pvw_pgm_channel',
      data: { index: props.index }
    }).then((res: any) => {
      if (res.input_index >= 0) {
        mitt.emit('PVWInput', res.input_index)
      }
    })
    mitt.on('PGMInput', (val) => {
      if (val == props.index) {
        PGMBorder.value = true
      } else {
        PGMBorder.value = false
      }
    })
    rtc_url += 'pvw_channel'
  } else if (props.index == -2) {
    request({
      method: 'post',
      url: '/query_pvw_pgm_channel',
      data: { index: props.index }
    }).then((res: any) => {
      if (res.input_index >= 0) {
        mitt.emit('PGMInput', res.input_index)
        mitt.emit('PGMStatus', { is_pushing: res.is_pushing })
      }
    })
    rtc_url += 'pgm_channel'
  }
  startPlayer(player, rtc_url)
} else {
  mitt.on('PVWInput', (val) => {
    if (val == props.index) {
      PVWBorder.value = true
    } else {
      PVWBorder.value = false
    }
  })
  mitt.on('PGMInput', (val) => {
    if (val == props.index) {
      PGMBorder.value = true
    } else {
      PGMBorder.value = false
    }
  })
  showVideoControl.value = false
  showInputControl.value = true
  rtc_url += 'input_channel_' + props.index
  request({
    method: 'post',
    url: '/query_input_channel',
    data: { index: props.index }
  }).then((res: any) => {
    if (!res.success) {
      ElMessage.error('/query_input_channel:' + res.error)
      return
    }
    if (res.source_url != '') {
      startPlayer(player, rtc_url)
      source_url.value = res.source_url
    }
  })
}

function startPlayer(player: any, url: string) {
  player.play(url).catch(function (reason: any) {
    player.close()
    ElMessage.error(reason)
  })
}

function stopPlayer() {
  player.stop()
}

function Switch2PVW() {
  switchLoading.value = true
  request({
    method: 'post',
    url: '/switch_pvw_pgm_channel',
    data: { index: -1, input_index: props.index }
  }).then((res: any) => {
    switchLoading.value = false
    if (!res.success) {
      ElMessage.error('/switch_pvw_pgm_channel:' + res.error)
      return
    }
    mitt.emit('PVWInput', props.index)
  })
}

function Switch2PGM() {
  switchLoading.value = true
  request({
    method: 'post',
    url: '/switch_pvw_pgm_channel',
    data: { index: -2, input_index: props.index }
  }).then((res: any) => {
    switchLoading.value = false
    if (!res.success) {
      ElMessage.error('/switch_pvw_pgm_channel:' + res.error)
      return
    }
    mitt.emit('PGMInput', props.index)
  })
}

function Stop() {
  playStopLoading.value = true
  request({
    method: 'post',
    url: '/stop_input_channel',
    data: { index: props.index }
  }).then((res: any) => {
    playStopLoading.value = false
    if (!res.success) {
      ElMessage.error('/stop_input_channel:' + res.error)
      return
    }
    stopPlayer()
  })
}

function Play() {
  if (source_url.value == '') {
    ElMessage.warning('请输入播流地址')
    return
  }
  show.value = false
  playStopLoading.value = true
  request({
    method: 'post',
    url: '/create_input_channel',
    data: { index: props.index, source_url: source_url.value }
  }).then((res: any) => {
    if (!res.success) {
      ElMessage.error('/create_input_channel:' + res.error)
    }
    playStopLoading.value = false
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
  box-sizing: border-box;
}
.pgm-border {
  border: 2px solid red;
}
.pvw-border {
  border: 2px solid yellow;
}
</style>
