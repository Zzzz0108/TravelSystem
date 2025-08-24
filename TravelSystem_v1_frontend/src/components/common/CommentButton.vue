<template>
  <button class="comment-button" @click="handleClick">
    <el-icon><ChatDotRound /></el-icon>
    <span v-if="count !== undefined">{{ count }}</span>
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'

const props = defineProps({
  count: {
    type: Number,
    default: undefined
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.comment-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 10px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: rgba(255, 255, 255, 0.8);
  
  &:hover {
    background: rgba(0, 0, 0, 0.6);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    color: #ffffff;
  }
}

.el-icon {
  font-size: 18px;
}

span {
  font-size: 14px;
  font-weight: 500;
  color: currentColor;
}
</style> 