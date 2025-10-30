import { createRouter, createWebHashHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import HistoryView from '../views/GraphView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'
import StatiView from '@/views/StatiView.vue'


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
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView
  },
  {
    path: '/stati',
    name: 'stati',
    component: StatiView
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
