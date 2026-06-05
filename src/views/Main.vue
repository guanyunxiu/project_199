<template>
  <div class="main-container">
    <Header />
    <div class="main-content">
      <Sidebar />
      <div class="content-wrapper">
        <div class="scene-wrapper">
          <Scene3D />
        </div>
        <div class="panels-wrapper">
          <ControlPanel />
          <DataPanel />
        </div>
      </div>
    </div>
    <DeviceInfo v-if="simulationStore.selectedDevice" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useSimulationStore } from '@/store/simulation'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import Scene3D from '@/components/Scene3D.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import DataPanel from '@/components/DataPanel.vue'
import DeviceInfo from '@/components/DeviceInfo.vue'

const userStore = useUserStore()
const simulationStore = useSimulationStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.main-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0A1628;
  overflow: hidden;

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;

    .content-wrapper {
      flex: 1;
      display: flex;
      overflow: hidden;
      position: relative;

      .scene-wrapper {
        flex: 1;
        position: relative;
        overflow: hidden;
      }

      .panels-wrapper {
        width: 360px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        padding: 15px;
        background: rgba(15, 28, 51, 0.6);
        backdrop-filter: blur(10px);
        border-left: 1px solid rgba(24, 144, 255, 0.2);
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(24, 144, 255, 0.3);
          border-radius: 3px;
        }
      }
    }
  }
}

@media (max-width: 1440px) {
  .main-container .main-content .content-wrapper .panels-wrapper {
    width: 320px;
  }
}

@media (max-width: 1280px) {
  .main-container .main-content .content-wrapper .panels-wrapper {
    width: 300px;
    padding: 10px;
    gap: 10px;
  }
}
</style>
