<template>
  <el-dialog v-model="dialogFormVisible" title="设置预览数量" width="500">
    <el-form :model="form">
      <el-form-item label="预览数量" :label-width="formLabelWidth">
        <el-input type="number" v-model="form.num" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="ReturnVal">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

let dialogFormVisible = ref(false)

const formLabelWidth = '100px'

const emit = defineEmits(['GetVal'])

const form = reactive({
  num: 4
})

function ReturnVal() {
  emit('GetVal', form.num)
  dialogFormVisible.value = false
}

const open = () => {
  dialogFormVisible.value = true
}

defineExpose({ open })
</script>
