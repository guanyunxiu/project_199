import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('@/views/Main.vue'),
    redirect: '/main/monitor',
    children: [
      {
        path: 'monitor',
        name: 'Monitor',
        component: () => import('@/views/Monitor.vue')
      },
      {
        path: 'devices',
        name: 'Devices',
        component: () => import('@/views/Devices.vue')
      },
      {
        path: 'production',
        name: 'Production',
        component: () => import('@/views/Production.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue')
      },
      {
        path: 'config-editor',
        name: 'ConfigEditor',
        component: () => import('@/views/ConfigEditor.vue')
      },
      {
        path: 'advanced-simulation',
        name: 'AdvancedSimulation',
        component: () => import('@/views/AdvancedSimulation.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.path !== '/login' && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
