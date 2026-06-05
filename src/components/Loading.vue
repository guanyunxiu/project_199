<template>
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="loader-3d">
        <div class="cube-container">
          <div class="cube">
            <div class="cube-face front"></div>
            <div class="cube-face back"></div>
            <div class="cube-face right"></div>
            <div class="cube-face left"></div>
            <div class="cube-face top"></div>
            <div class="cube-face bottom"></div>
          </div>
        </div>
        <div class="ring ring-1"></div>
        <div class="ring ring-2"></div>
        <div class="ring ring-3"></div>
      </div>
      
      <div class="loading-text">
        <span class="text-main">正在加载</span>
        <span class="text-progress">{{ progress }}%</span>
      </div>
      
      <div class="loading-bar">
        <div class="bar-progress" :style="{ width: progress + '%' }"></div>
      </div>
      
      <span class="text-sub">{{ loadingTip }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  progress: {
    type: Number,
    default: 0
  }
})

const loadingTip = ref('正在初始化3D场景...')
const tips = [
  '正在初始化3D场景...',
  '加载设备模型中...',
  '准备仿真数据...',
  '连接控制系统...',
  '即将完成...'
]

let tipTimer = null

onMounted(() => {
  let tipIndex = 0
  tipTimer = setInterval(() => {
    tipIndex = (tipIndex + 1) % tips.length
    loadingTip.value = tips[tipIndex]
  }, 2000)
})

onUnmounted(() => {
  if (tipTimer) {
    clearInterval(tipTimer)
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, $bg-color-primary 0%, $bg-color-secondary 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.loader-3d {
  position: relative;
  width: 160px;
  height: 160px;
  perspective: 1000px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cube-container {
  width: 60px;
  height: 60px;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: cubeRotate 3s infinite ease-in-out;
}

@keyframes cubeRotate {
  0% {
    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  25% {
    transform: rotateX(90deg) rotateY(90deg) rotateZ(0deg);
  }
  50% {
    transform: rotateX(180deg) rotateY(180deg) rotateZ(90deg);
  }
  75% {
    transform: rotateX(270deg) rotateY(270deg) rotateZ(180deg);
  }
  100% {
    transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
  }
}

.cube-face {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid $primary-color;
  background: rgba(24, 144, 255, 0.1);
  box-shadow: inset 0 0 30px rgba(24, 144, 255, 0.3);

  &.front {
    transform: translateZ(30px);
  }

  &.back {
    transform: rotateY(180deg) translateZ(30px);
  }

  &.right {
    transform: rotateY(90deg) translateZ(30px);
  }

  &.left {
    transform: rotateY(-90deg) translateZ(30px);
  }

  &.top {
    transform: rotateX(90deg) translateZ(30px);
  }

  &.bottom {
    transform: rotateX(-90deg) translateZ(30px);
  }
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: $primary-color;
  border-left-color: rgba(24, 144, 255, 0.3);

  &.ring-1 {
    width: 90px;
    height: 90px;
    animation: ringRotate 2s linear infinite;
  }

  &.ring-2 {
    width: 120px;
    height: 120px;
    animation: ringRotate 2.5s linear infinite reverse;
    border-top-color: $primary-color-light;
    border-left-color: rgba(64, 169, 255, 0.2);
  }

  &.ring-3 {
    width: 150px;
    height: 150px;
    animation: ringRotate 3s linear infinite;
    border-top-color: rgba(24, 144, 255, 0.6);
    border-left-color: rgba(24, 144, 255, 0.1);
  }
}

@keyframes ringRotate {
  0% {
    transform: rotateX(70deg) rotateZ(0deg);
  }
  100% {
    transform: rotateX(70deg) rotateZ(360deg);
  }
}

.loading-text {
  display: flex;
  align-items: baseline;
  gap: 12px;

  .text-main {
    font-size: 24px;
    font-weight: 600;
    color: $text-color-primary;
    letter-spacing: 4px;
  }

  .text-progress {
    font-size: 28px;
    font-weight: 700;
    color: $primary-color;
    font-family: 'Monaco', 'Consolas', monospace;
  }
}

.loading-bar {
  width: 280px;
  height: 4px;
  background: rgba(24, 144, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.bar-progress {
  height: 100%;
  background: linear-gradient(90deg, $primary-color, $primary-color-light);
  border-radius: 2px;
  transition: width 0.3s ease;
  box-shadow: 0 0 20px rgba(24, 144, 255, 0.5);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 30px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: barShine 1.5s infinite;
  }
}

@keyframes barShine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.text-sub {
  font-size: 13px;
  color: $text-color-tertiary;
  animation: fadeText 2s infinite ease-in-out;
}

@keyframes fadeText {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>
