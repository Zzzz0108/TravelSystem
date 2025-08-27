<!-- src/components/common/FloatingActionButton.vue -->
<template>
  <button 
    class="fab-container"
    @click="$emit('click')"
  >
    <svg class="fab-icon" viewBox="0 0 24 24">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  </button>
</template>

<script setup>
// 空脚本标签保持组件结构
</script>

<style scoped>
.fab-container {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(0, 122, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  &:hover {
    background: rgba(0, 122, 255, 1);
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 40px rgba(0, 122, 255, 0.4);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &:active {
    transform: translateY(-2px) scale(1.02);
  }
}

.fab-icon {
  width: 28px;
  height: 28px;
  fill: currentColor;
  transition: all 0.3s ease;
}

.fab-container:hover .fab-icon {
  transform: rotate(90deg);
}

/* 在FloatingActionButton组件中添加样式 */
.floating-btn {
  position: fixed;
  bottom: 40px;
  right: 40px;
  background: #0071e3;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    background: #0051a3;
  }
}

</style>