import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'SpringMain',
    component: () => import(/* webpackChunkName: "SpringMain" */ '../pages/SpringMain')
  },
  {
    path: '/songList',
    name: 'SongList',
    component: () => import(/* webpackChunkName: "SongList" */ '../pages/SongList')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/spring-festival/',
  routes
})

export default router
