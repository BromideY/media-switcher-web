<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container">
    <div class="header">
      <div class="control">
        <el-button @click="showPreviewNumDialog" type="primary" :icon="Setting">预览数量</el-button>
        <el-button @click="showSetMainChannelDialog" type="primary" :icon="Setting"
          >主画面参数</el-button
        >
        <el-button @click="StartPush" type="primary" :loading="pushLoading">开始推流</el-button>
        <el-button @click="StopPush" type="primary" :loading="pushLoading">结束推流</el-button>
      </div>
    </div>
    <div class="content">
      <div class="main">
        <div style="text-align: center">
          <RtcPlayer :playerWidth="640" :playerHeight="360" :index="-1"></RtcPlayer>
          <el-text class="main-player-label">主画面</el-text>
        </div>
        <div style="text-align: center">
          <HlsPlayer :playerWidth="640" :playerHeight="360" ref="HlsPlayerInstance"></HlsPlayer>
          <el-text class="main-player-label">输出画面({{ pushStatus }})</el-text>
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
import mitt from '../utils/mitt'
import { ref } from 'vue'
import { request } from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'

let preview_num = ref(8)
request({
  method: 'post',
  url: '/query_preview_channel_num',
  data: {}
}).then((res: any) => {
  if (!res.success) {
    ElMessage.error('/query_preview_channel_num:' + res.error)
    return
  }
  if (res.preview_channel_num >= 8) {
    preview_num.value = res.preview_channel_num + 1
  }
})

let SetPreviewNumDialogInstance = ref()
let SetMainChannelDialogInstance = ref()
let HlsPlayerInstance = ref()
let pushLoading = ref(false)
let pushStatus = ref('未推流')

function showPreviewNumDialog() {
  SetPreviewNumDialogInstance.value.open()
}

function showSetMainChannelDialog() {
  SetMainChannelDialogInstance.value.open()
}

mitt.on('SetHlsUrl', (val: any) => {
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
    ElMessage.success(JSON.stringify(res))
    pushStatus.value = '推流中'
    if (res.success == true) {
      HlsPlayerInstance.value.StartPlay()
    }
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
    ElMessage.success(JSON.stringify(res))
    HlsPlayerInstance.value.StopPlay()
  })
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
.header .control {
  margin-left: 30px;
}
.preview_control {
  margin-left: 10px;
}
.content {
  width: 1500px;
  margin: 0 auto;
  margin-top: 10px;
}
.main {
  display: flex;
  justify-content: space-around;
}
.preview-player {
  margin-left: 27px;
  margin-right: 27px;
  margin-top: 5px;
}
.preview {
  margin-top: 10px;
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
