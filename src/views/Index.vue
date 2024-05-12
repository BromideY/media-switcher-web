<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container">
    <div class="header">
      <el-button @click="showPreviewNumDialog" type="primary">设置预览数量</el-button>
      <el-button @click="showSetMainChannelDialog" type="primary">主画面参数</el-button>
      <el-button @click="StartPush" type="primary">开始推流</el-button>
      <el-button @click="StopPush" type="primary">结束推流</el-button>
    </div>
    <div class="main">
      <div style="text-align: center">
        <RtcPlayer :playerWidth="640" :playerHeight="360" :index="-1"></RtcPlayer>
        <el-text class="main-player-label">主监画面</el-text>
      </div>
      <div style="text-align: center">
        <HlsPlayer :playerWidth="640" :playerHeight="360" ref="HlsPlayerInstance"></HlsPlayer>
        <el-text class="main-player-label">输出画面</el-text>
      </div>
    </div>
    <div class="preview">
      <RtcPlayer
        v-for="(i, index) in preview_num"
        :key="i"
        class="preview-player"
        :playerWidth="320"
        :playerHeight="180"
        :index="index"
      ></RtcPlayer>
    </div>
  </div>
  <div>
    <SetPreviewNumDialog
      ref="SetPreviewNumDialogInstance"
      @GetVal="GetSetPreviewNumDialogVal"
    ></SetPreviewNumDialog>
    <SetMainChannelDialog ref="SetMainChannelDialogInstance"></SetMainChannelDialog>
  </div>
</template>

<script setup lang="ts">
import SetPreviewNumDialog from '../components/SetPreviewNumDialog.vue'
import SetMainChannelDialog from '../components/SetMainChannelDialog.vue'
import RtcPlayer from '../components/RtcPlayer.vue'
import HlsPlayer from '../components/HlsPlayer.vue'
import { ref } from 'vue'
import { request } from '@/utils/request'
import { ElMessage } from 'element-plus'

let preview_num = ref(4)
request({
  method: 'post',
  url: '/query_preview_channel_num',
  data: {}
}).then((res: any) => {
  if (res.preview_channel_num > 0) {
    preview_num.value = res.preview_channel_num
  }
})

let SetPreviewNumDialogInstance = ref()
let SetMainChannelDialogInstance = ref()
let HlsPlayerInstance = ref()

function showPreviewNumDialog() {
  SetPreviewNumDialogInstance.value.open()
}

function showSetMainChannelDialog() {
  SetMainChannelDialogInstance.value.open()
}

function StartPush() {
  request({
    method: 'post',
    url: '/start_push',
    data: {}
  }).then((res: any) => {
    ElMessage.info(JSON.stringify(res))
  })
  HlsPlayerInstance.value.StartPlay()
}

function StopPush() {
  request({
    method: 'post',
    url: '/stop_push',
    data: {}
  })
  HlsPlayerInstance.value.StopPlay()
}

function GetSetPreviewNumDialogVal(val: any) {
  if (val > 0) {
    preview_num.value = 0
    while (val-- > 0) {
      preview_num.value++
    }
  }
}
</script>
<style scoped>
.header {
  margin-top: 10px;
  display: flex;
}
.preview_control {
  margin-left: 10px;
}
.container {
  width: 1500px;
  margin: 0 auto;
}
.main {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;
}
.preview-player {
  margin-left: 27px;
  margin-right: 27px;
}
.preview {
  margin-top: 15px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-left: auto;
  margin-right: auto;
}
.main-player-label {
  display: inline-block;
  margin-top: 10px;
  font-size: 30px;
}
</style>
