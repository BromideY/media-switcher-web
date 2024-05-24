<template>
  <el-dialog v-model="dialogFormVisible" title="设置PVW/PGM参数" width="500">
    <el-form :model="form">
      <el-form-item label="视频幅面宽度" :label-width="formLabelWidth">
        <el-input type="number" v-model.number="form.video.width" />
      </el-form-item>
      <el-form-item label="视频幅面高度" :label-width="formLabelWidth">
        <el-input type="number" v-model.number="form.video.height" />
      </el-form-item>
      <el-form-item label="视频帧率" :label-width="formLabelWidth">
        <el-input type="number" v-model.number="form.video.frame_rate" />
      </el-form-item>
      <el-form-item label="视频码率(kbps)" :label-width="formLabelWidth">
        <el-input type="number" v-model.number="form.video.bit_rate" />
      </el-form-item>
      <el-form-item label="音频声道数" :label-width="formLabelWidth">
        <el-input type="number" v-model.number="form.audio.channels" />
      </el-form-item>
      <el-form-item label="音频采样率" :label-width="formLabelWidth">
        <el-select v-model.number="form.audio.sample_rate" placeholder="Select">
          <el-option
            v-for="item in sample_rate_option"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="音频码率(kbps)" :label-width="formLabelWidth">
        <el-input type="number" v-model.number="form.audio.bit_rate" />
      </el-form-item>
      <el-form-item label="推流地址(rtmp)" :label-width="formLabelWidth">
        <el-input type="string" v-model="form.output_url" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="Confirm" :loading="isLoading">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { request } from '@/utils/request'
import { ElMessage } from 'element-plus'
import mitt from '@/utils/mitt'

let dialogFormVisible = ref(false)

const formLabelWidth = '150px'

const sample_rate_option = [
  {
    value: 48000,
    label: '48000'
  },
  {
    value: 44100,
    label: '44100'
  },
  {
    value: 32000,
    label: '32000'
  },
  {
    value: 16000,
    label: '16000'
  }
]

let host = window.location.hostname

const form = reactive({
  video: {
    width: 1280,
    height: 720,
    frame_rate: 25,
    bit_rate: 1000
  },
  audio: {
    channels: 2,
    sample_rate: 44100,
    bit_rate: 64
  },
  output_url: 'rtmp://' + host + '/live/output'
})

request({
  method: 'post',
  url: '/query_pvw_pgm_channel',
  data: {}
}).then((res: any) => {
  if (res.success) {
    form.video = res.channel_params.video
    form.audio = res.channel_params.audio
    form.output_url = res.channel_params.output_url
  }
})

let isLoading = ref(false)

function Confirm() {
  isLoading.value = true
  let createPVW = request({
    method: 'post',
    url: '/create_pvw_pgm_channel',
    data: {
      index: -1,
      video: form.video,
      audio: form.audio
    }
  })
  let createPGM = request({
    method: 'post',
    url: '/create_pvw_pgm_channel',
    data: {
      index: -2,
      video: form.video,
      audio: form.audio,
      output_url: form.output_url
    }
  })
  Promise.all([createPVW, createPGM]).then((res: any) => {
    isLoading.value = false
    if (!res[0].success || !res[1].success) {
      ElMessage.error('/create_pvw_pgm_channel:' + res[0].error + ',' + res[1].error)
    } else {
      ElMessage.success('成功创建PVW/PGM通道')
    }
    dialogFormVisible.value = false
    mitt.emit('PGMStatus', { is_pushing: false })
  })
}

const open = () => {
  dialogFormVisible.value = true
}

defineExpose({ open })
</script>