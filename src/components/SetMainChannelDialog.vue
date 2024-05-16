<template>
  <el-dialog v-model="dialogFormVisible" title="设置主画面参数" width="500">
    <el-form :model="form">
      <el-form-item label="视频幅面宽度" :label-width="formLabelWidth">
        <el-input type="number" v-model.number="form.video.width" autocomplete="off" />
      </el-form-item>
      <el-form-item label="视频幅面高度" :label-width="formLabelWidth">
        <el-input type="number" v-model.number="form.video.height" autocomplete="off" />
      </el-form-item>
      <el-form-item label="视频帧率" :label-width="formLabelWidth">
        <el-input type="number" v-model.number="form.video.frame_rate" autocomplete="off" />
      </el-form-item>
      <el-form-item label="视频码率(kbps)" :label-width="formLabelWidth">
        <el-input type="number" v-model.number="form.video.bit_rate" autocomplete="off" />
      </el-form-item>
      <el-form-item label="音频声道数" :label-width="formLabelWidth">
        <el-input type="number" v-model.number="form.audio.channels" autocomplete="off" />
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
        <el-input type="number" v-model.number="form.audio.bit_rate" autocomplete="off" />
      </el-form-item>
      <el-form-item label="推流地址(rtmp)" :label-width="formLabelWidth">
        <el-input type="string" v-model="form.output_url" autocomplete="off" />
      </el-form-item>
      <el-form-item label="播流地址(m3u8)" :label-width="formLabelWidth">
        <el-input type="string" v-model="form.play_url" autocomplete="off" />
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
  output_url: 'rtmp://localhost/live/output',
  play_url: 'http://localhost:8080/hls/live/output.m3u8'
})

request({
  method: 'post',
  url: '/query_main_channel',
  data: {}
}).then((res: any) => {
  if (!res.success) {
    ElMessage.error('/query_main_channel:' + res.error)
  } else {
    form.video = res.channel_params.video
    form.audio = res.channel_params.audio
    form.output_url = res.channel_params.output_url
    form.play_url = res.channel_params.play_url
    mitt.emit('SetHlsUrl', { url: form.play_url, is_pushing: res.is_pushing })
  }
})

let isLoading = ref(false)

function Confirm() {
  isLoading.value = true
  request({
    method: 'post',
    url: '/create_main_channel',
    data: {
      video: form.video,
      audio: form.audio,
      output_url: form.output_url,
      play_url: form.play_url
    }
  }).then((res: any) => {
    if (!res.success) {
      ElMessage.error('/create_main_channel:' + res.error)
      return
    }
    ElMessage.success(JSON.stringify(res))
    isLoading.value = false
    dialogFormVisible.value = false
    mitt.emit('SetHlsUrl', { url: form.play_url, is_pushing: false })
  })
}

const open = () => {
  dialogFormVisible.value = true
}

defineExpose({ open })
</script>
