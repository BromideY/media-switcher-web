import axios, { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  timeout: 60000,
  baseURL: '/api'
})

request.interceptors.response.use(
  (response): any => {
    return response.data
  },
  (err: AxiosError) => {
    const errMsg = err.response?.status + ' ' + err.response?.config.url
    ElMessage.error(errMsg)
    return Promise.reject(errMsg)
  }
)

export { request }
