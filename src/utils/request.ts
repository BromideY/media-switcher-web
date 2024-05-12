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
    const errMsg =
      'http code: ' +
      err.response?.status +
      ',url:' +
      err.response?.config.url +
      ',data:' +
      JSON.stringify(err.response?.data)
    ElMessage.error(errMsg)
    return Promise.reject(err)
  }
)

export { request }
