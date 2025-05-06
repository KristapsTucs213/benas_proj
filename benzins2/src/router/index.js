import { createRouter, createWebHashHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import HistoryView from '../views/GraphView.vue'

const routes = [
  {
    path: '/',
    name: 'benzins',
    component: MainView
  },
  {
    path: '/cenasvesture',
    name: 'history',
    component: HistoryView
  },
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  // }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
