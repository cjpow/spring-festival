import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'SpringMain',
    component: () => import(/* webpackChunkName: "SpringMain" */ '../pages/SpringMain.vue')
  },
  {
    path: '/songList',
    name: 'SongList',
    component: () => import(/* webpackChunkName: "SongList" */ '../pages/SongList')
  },
  {
    path: '/sharing',
    name: 'sharing',
    component: () => import(/* webpackChunkName: "SongList" */ '../pages/Sharing.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/spring-festival/',
  routes
})

export default router
