<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container">
    <div class="header">
      <el-button @click="showPreviewNumDialog" type="primary">设置预览数量</el-button>
      <el-button @click="showSetMainChannelDialog" type="primary">主画面参数</el-button>
    </div>
    <div class="main">
      <Player class="real-player" :playerWidth="640" :playerHeight="360" :index="-1"></Player>
    </div>
    <div class="preview">
      <Player
        v-for="(i, index) in preview_num"
        :key="i"
        class="preview-player"
        :playerWidth="320"
        :playerHeight="180"
        :index="index"
      ></Player>
    </div>
  </div>
  <div>
    <SetPreviewNumDialog
      ref="openSetPreviewNumDialog"
      @GetVal="GetSetPreviewNumDialogVal"
    ></SetPreviewNumDialog>
    <SetMainChannelDialog ref="openSetMainChannelDialog"></SetMainChannelDialog>
  </div>
</template>

<script setup lang="ts">
import SetPreviewNumDialog from '../components/SetPreviewNumDialog.vue'
import SetMainChannelDialog from '../components/SetMainChannelDialog.vue'
import { ref } from 'vue'
import Player from '../components/Player.vue'
import { request } from '@/utils/request'
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

let openSetPreviewNumDialog = ref()
let openSetMainChannelDialog = ref()

function showPreviewNumDialog() {
  openSetPreviewNumDialog.value.open()
}

function showSetMainChannelDialog() {
  openSetMainChannelDialog.value.open()
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
  display: flex;
  justify-content: center;
}
.preview-player {
  margin-left: 27px;
  margin-right: 27px;
}
.preview {
  margin-top: 30px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-left: auto;
  margin-right: auto;
}
</style>
