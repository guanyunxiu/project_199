import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const username = ref('')
  const isLoggedIn = ref(false)

  const login = (name, password) => {
    if (name === 'admin' && password === 'admin123') {
      username.value = name
      isLoggedIn.value = true
      return true
    }
    return false
  }

  const logout = () => {
    username.value = ''
    isLoggedIn.value = false
  }

  return {
    username,
    isLoggedIn,
    login,
    logout
  }
})
