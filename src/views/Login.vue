<template>
  <div class="login-container">
    <div class="bg-decoration">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="grid-pattern"></div>
    </div>
    
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <el-icon :size="48" color="#1890FF">
            <Monitor />
          </el-icon>
        </div>
        <h1 class="system-title">智能车间3D监控系统</h1>
        <p class="system-subtitle">Intelligent Workshop 3D Monitoring System</p>
      </div>
      
      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账号"
            size="large"
            :prefix-icon="User"
            class="login-input"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            class="login-input"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <div class="login-options">
          <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
        </div>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>© 2024 智能工厂技术中心 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Monitor } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        const success = userStore.login(loginForm.username, loginForm.password)
        if (success) {
          ElMessage.success('登录成功')
          router.push('/main')
        } else {
          ElMessage.error('账号或密码错误')
        }
        loading.value = false
      }, 800)
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0A1628 0%, #0F1C33 50%, #132238 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #1890FF 0%, transparent 70%);
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #52C41A 0%, transparent 70%);
  bottom: -150px;
  left: -150px;
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, 30px); }
}

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(24, 144, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(24, 144, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
}

.login-card {
  position: relative;
  z-index: 10;
  width: 420px;
  padding: 48px 40px;
  background: rgba(15, 28, 51, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(24, 144, 255, 0.3);
  border-radius: 12px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(24, 144, 255, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.2) 0%, rgba(24, 144, 255, 0.05) 100%);
  border: 1px solid rgba(24, 144, 255, 0.4);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.system-title {
  font-size: 24px;
  font-weight: 600;
  color: #E6F0FF;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.system-subtitle {
  font-size: 12px;
  color: #8C9BB3;
  margin: 0;
  letter-spacing: 1px;
}

.login-form {
  margin-bottom: 20px;
}

.login-input {
  :deep(.el-input__wrapper) {
    background: rgba(10, 22, 40, 0.8);
    border: 1px solid rgba(24, 144, 255, 0.2);
    border-radius: 8px;
    box-shadow: none;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: rgba(24, 144, 255, 0.5);
    }
    
    &.is-focus {
      border-color: #1890FF;
      box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
    }
  }
  
  :deep(.el-input__inner) {
    color: #E6F0FF;
    
    &::placeholder {
      color: #5C6B80;
    }
  }
  
  :deep(.el-input__prefix-inner) {
    color: #5C6B80;
  }
}

.login-options {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24px;
  
  :deep(.el-checkbox__label) {
    color: #8C9BB3;
    font-size: 14px;
  }
  
  :deep(.el-checkbox__inner) {
    background: rgba(10, 22, 40, 0.8);
    border-color: rgba(24, 144, 255, 0.3);
    
    &:hover {
      border-color: #1890FF;
    }
  }
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #1890FF 0%, #40A9FF 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(24, 144, 255, 0.4),
      0 0 30px rgba(24, 144, 255, 0.2);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(24, 144, 255, 0.1);
  
  p {
    margin: 0;
    font-size: 12px;
    color: #5C6B80;
  }
}
</style>
