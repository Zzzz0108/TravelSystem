<template>
  
  <div class="user-avatar">
    <img v-if="src" :src="src" :alt="name" class="avatar-image" />
    <div v-else class="avatar-placeholder">
      {{ user?.name?.charAt(0) ?? '?' }} <!-- 安全访问 -->
    </div>
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({ name: '匿名用户' }), // 设置默认值
    validator: (user) => user.name !== undefined // 验证 name 属性存在
  }
})
</script>

<style scoped>

.user-avatar {
  display: block;
  width: 22.5px;
  height: 22.5px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid #006aff; 
  box-shadow: 0 0 8px rgba(0, 51, 203, 0.6);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.avatar-placeholder {
  font-size: calc(v-bind(size) / 2);
  font-weight: bold;
  color: #666;
}
</style>