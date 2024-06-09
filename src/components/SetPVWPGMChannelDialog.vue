<template>
  <el-dialog v-model="dialogFormVisible" title="设置PVW/PGM参数" width="500">
    <el-form :model="form" ref="ruleFormRef" :rules="rules">
      <el-form-item label="视频幅面宽度" :label-width="formLabelWidth" prop="video.width">
        <el-input v-model.number="form.video.width" clearable />
      </el-form-item>
      <el-form-item label="视频幅面高度" :label-width="formLabelWidth" prop="video.height">
        <el-input v-model.number="form.video.height" clearable />
      </el-form-item>
      <el-form-item label="视频帧率" :label-width="formLabelWidth" prop="video.frame_rate">
        <el-input v-model.number="form.video.frame_rate" clearable />
      </el-form-item>
      <el-form-item label="视频码率(kbps)" :label-width="formLabelWidth" prop="video.bit_rate">
        <el-input v-model.number="form.video.bit_rate" clearable />
      </el-form-item>
      <el-form-item label="音频声道数" :label-width="formLabelWidth" prop="audio.channels">
        <el-input v-model.number="form.audio.channels" clearable />
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
      <el-form-item label="音频码率(kbps)" :label-width="formLabelWidth" prop="audio.bit_rate">
        <el-input v-model.number="form.audio.bit_rate" clearable />
      </el-form-item>
      <el-form-item label="推流地址(rtmp)" :label-width="formLabelWidth" prop="output_url">
        <el-input v-model="form.output_url" clearable />
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
    width: 640,
    height: 360,
    frame_rate: 15,
    bit_rate: 200
  },
  audio: {
    channels: 1,
    sample_rate: 16000,
    bit_rate: 32
  },
  output_url: 'rtmp://127.0.0.1/live/output'
})

const ruleFormRef = ref()

const rules = reactive({
  output_url: [{ required: true, message: '不能为空', trigger: 'blur' }],
  'audio.bit_rate': [
    { required: true, message: '不能为空', trigger: 'blur' },
    { type: 'number', min: 0, max: 128, message: '介于0到128之间', trigger: 'blur' }
  ],
  'audio.channels': [
    { required: true, message: '不能为空', trigger: 'blur' },
    { type: 'number', min: 1, max: 8, message: '介于1到8之间', trigger: 'blur' }
  ],
  'video.width': [
    { required: true, message: '不能为空', trigger: 'blur' },
    { type: 'number', min: 1, max: 1920, message: '介于1到1920之间', trigger: 'blur' }
  ],
  'video.height': [
    { required: true, message: '不能为空', trigger: 'blur' },
    { type: 'number', min: 1, max: 1080, message: '介于1到1080之间', trigger: 'blur' }
  ],
  'video.frame_rate': [
    { required: true, message: '不能为空', trigger: 'blur' },
    { type: 'number', min: 1, max: 60, message: '介于1到60之间', trigger: 'blur' }
  ],
  'video.bit_rate': [
    { required: true, message: '不能为空', trigger: 'blur' },
    { type: 'number', min: 1, max: 10000, message: '介于1到10000之间', trigger: 'blur' }
  ]
})

request({
  method: 'post',
  url: '/query_pvw_pgm_channel',
  data: { index: -2 }
}).then((res: any) => {
  if (res.success) {
    form.video = res.channel_params.video
    form.audio = res.channel_params.audio
    form.output_url = res.channel_params.output_url
  }
})

let isLoading = ref(false)

function Confirm() {
  ruleFormRef.value.validate((valid: any) => {
    if (valid) {
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
  })
}

const open = () => {
  dialogFormVisible.value = true
}

defineExpose({ open })
</script>
