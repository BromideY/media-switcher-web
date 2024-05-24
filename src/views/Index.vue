<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container">
    <div class="header">
      <img class="logo" src="/logo.png" alt="logo" />
      <el-button @click="showInputNumDialog" type="primary" :icon="Setting">源流数量</el-button>
      <el-button @click="showSetPVWPGMChannelDialog" type="primary" :icon="Setting"
        >PGM/PVW参数</el-button
      >
      <el-button @click="SceneEditor" type="primary" :icon="Setting">主画面特效</el-button>
      <el-button @click="StartPush" type="primary" :loading="pushLoading">开始推流</el-button>
      <el-button @click="StopPush" type="primary" :loading="pushLoading">结束推流</el-button>
    </div>
    <div class="content">
      <div class="pvw-pgm">
        <div style="text-align: center">
          <RtcPlayer class="player" :playerWidth="640" :playerHeight="360" :index="-1"></RtcPlayer>
          <el-text class="player-label">PVW</el-text>
        </div>
        <el-button @click="Take" type="primary" size="large"
          >切换到PGM<el-icon><ArrowRightBold /></el-icon
        ></el-button>
        <div style="text-align: center">
          <RtcPlayer class="player" :playerWidth="640" :playerHeight="360" :index="-2"></RtcPlayer>
          <el-text class="player-label">PGM({{ pushStatus }})</el-text>
        </div>
      </div>
      <div class="input">
        <RtcPlayer
          v-for="(i, index) in input_num"
          :key="i"
          class="input-player player"
          :playerWidth="320"
          :playerHeight="180"
          :index="index"
        ></RtcPlayer>
      </div>
    </div>
  </div>
  <div>
    <SetInputNumDialog
      ref="SetInputNumDialogInstance"
      @GetVal="GetSetInputNumDialogVal"
    ></SetInputNumDialog>
    <SetPVWPGMChannelDialog ref="SetPVWPGMChannelDialogInstance"></SetPVWPGMChannelDialog>
  </div>
</template>

<script setup lang="ts">
import SetInputNumDialog from '../components/SetInputNumDialog.vue'
import SetPVWPGMChannelDialog from '../components/SetPVWPGMChannelDialog.vue'
import RtcPlayer from '../components/RtcPlayer.vue'
import mitt from '../utils/mitt'
import { ref } from 'vue'
import { request } from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Setting, ArrowRightBold } from '@element-plus/icons-vue'

let input_num = ref(8)
request({
  method: 'post',
  url: '/query_input_channel_num',
  data: {}
}).then((res: any) => {
  if (!res.success) {
    ElMessage.error('/query_input_channel_num:' + res.error)
    return
  }
  if (res.input_channel_num >= 8) {
    input_num.value = res.input_channel_num + 1
  }
})

let SetInputNumDialogInstance = ref()
let SetPVWPGMChannelDialogInstance = ref()
let pushLoading = ref(false)
let pushStatus = ref('未推流')

function showInputNumDialog() {
  SetInputNumDialogInstance.value.open()
}

function showSetPVWPGMChannelDialog() {
  SetPVWPGMChannelDialogInstance.value.open()
}

function Take() {
  request({
    method: 'post',
    url: '/switch_pvw_pgm_channel',
    data: { index: -2, input_index: -1 }
  }).then((res: any) => {
    if (!res.success) {
      ElMessage.error('/switch_pgm_channel:' + res.error)
      return
    }
    mitt.emit('PGMInput', -1)
  })
}

function SceneEditor() {
  window.open('/scene_editor', '_blank')
}

mitt.on('PGMStatus', (val: any) => {
  if (val.is_pushing) {
    pushStatus.value = '推流中'
  }
})

function StartPush() {
  pushLoading.value = true
  request({
    method: 'post',
    url: '/start_push',
    data: {}
  }).then((res: any) => {
    pushLoading.value = false
    if (!res.success) {
      ElMessage.error('/start_push:' + res.error)
      return
    }
    ElMessage.success('开始推流')
    pushStatus.value = '推流中'
  })
}

function StopPush() {
  pushLoading.value = true
  request({
    method: 'post',
    url: '/stop_push',
    data: {}
  }).then((res: any) => {
    pushLoading.value = false
    if (!res.success) {
      ElMessage.error('/stop_push:' + res.error)
      return
    }
    pushStatus.value = '未推流'
    ElMessage.success('结束推流')
  })
}

function GetSetInputNumDialogVal(val: any) {
  if (val > 0) {
    input_num.value = 0
    while (val-- > 0) {
      input_num.value++
    }
  }
}
</script>
<style scoped>
.container {
  background-color: #fafafa;
}
.header {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 999;
  height: 50px;
  align-items: center;
  background-color: #303133;
}
.header .logo {
  width: 200px;
}
.content {
  width: 1500px;
  margin: 0 auto;
  margin-top: 10px;
}
.pvw-pgm {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
.input-player {
  margin-left: 27px;
  margin-right: 27px;
  margin-top: 5px;
  transition: box-shadow 0.3s;
}
.player {
  transition: box-shadow 0.3s;
}
.player:hover {
  box-shadow: 0 0 15px black;
}
.input {
  margin-top: 10px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-left: auto;
  margin-right: auto;
}
.player-label {
  display: inline-block;
  margin-top: 10px;
  font-size: 30px;
}
</style>
