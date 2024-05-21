import Index from '@/views/Index.vue'
import Scene from '@/views/Scene.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Index
    },
    {
      path: '/scene',
      component: Scene
    }
  ]
})

export default router
