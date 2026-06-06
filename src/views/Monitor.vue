<template>
  <div class="monitor-page">
    <div class="scene-wrapper">
      <Scene3D />
    </div>
    <div class="panels-wrapper">
      <ControlPanel />
      <DataPanel />
    </div>
  </div>
</template>

<script setup>
import Scene3D from '@/components/Scene3D.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import DataPanel from '@/components/DataPanel.vue'
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.monitor-page {
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

@media (max-width: 1440px) {
  .monitor-page .panels-wrapper {
    width: 320px;
  }
}

@media (max-width: 1280px) {
  .monitor-page .panels-wrapper {
    width: 300px;
    padding: 10px;
    gap: 10px;
  }
}
</style>
