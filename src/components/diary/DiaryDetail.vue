<template>
  <div class="diary-detail">
    <!-- 日记内容 -->
    <div class="diary-content">
      <h1 class="title">{{ diary.title }}</h1>
      <div class="meta">
        <user-avatar :user="diary.author" class="neon-avatar" />
        <div class="info">
          <p class="username">{{ diary.author.name }}</p>
          <p class="date">{{ formatDate(diary.createdAt) }}</p>
        </div>
      </div>
      
      <!-- 媒体容器 -->
      <div class="media-container">
        <div 
          v-for="(img, index) in diary.images" 
          :key="index"
          class="media-card"
        >
          <img 
            :src="img"
            class="card-image"
            loading="lazy"
          >
        </div>
        <div v-if="diary.video" class="media-card">
          <video 
            :src="diary.video"
            class="card-video"
            controls
          ></video>
        </div>
      </div>

      <p class="content">{{ diary.content }}</p>
      
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="view-count">
          <svg class="view-icon" viewBox="0 0 24 24">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
          <span>{{ diary.views }}</span>
        </div>
        <like-button 
          :count="diary.likes" 
          :is-liked="diary.isLiked"
          @click="handleLike" 
          class="neon-like"
        />
        <comment-button 
          :count="diary.comments.length" 
          @click="scrollToComments"
          class="neon-comment"
        />
        <share-button @click="handleShare" class="neon-share"/>
      </div>
    </div>

    <!-- 评分区域 -->
    <div class="rating-section card-effect">
      <h3>RATING</h3>
      <div class="star-rating">
        <span 
          v-for="star in 5" 
          :key="star"
          class="star"
          :class="{ active: currentRating >= star }"
          @click="rateDiary(star)"
        ></span>
      </div>
      <p class="rating-text">{{ ratingText }}</p>
    </div>

    <!-- 评论区域 -->
    <div class="comments-section card-effect" id="comments">
      <h2>COMMENTS</h2>
      <div class="comment-list">
        <div 
          v-for="comment in diary.comments" 
          :key="comment.id"
          class="comment-item"
        >
          <user-avatar :user="comment.author" class="neon-avatar" />
          <div class="comment-content">
            <p class="username">{{ comment.author.name }}</p>
            <p class="text">{{ comment.text }}</p>
            <p class="date">{{ formatDate(comment.createdAt) }}</p>
          </div>
        </div>
      </div>
      <div class="comment-form">
        <textarea
          v-model="newComment"
          placeholder="写下你的评论..."
          class="neon-input"
        ></textarea>
        <button @click="postComment" class="neon-button">发布评论</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import UserAvatar from '@/components/common/UserAvatar.vue'
import LikeButton from '@/components/common/LikeButton.vue'

// 模拟数据
const diary = ref({
  id: 1,
  title: "CYBERPUNK TRAVEL LOG",
  author: {
    name: "NEON_EXPLORER",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  createdAt: "2024-03-20T08:00:00",
  content: `霓虹灯光下的赛博都市，悬浮列车在玻璃幕墙间穿梭。尝试了街边的全息拉面，味觉芯片带来的体验超乎想象...`,
  images: [
    "https://source.unsplash.com/800x600/?cyberpunk",
    "https://source.unsplash.com/800x600/?neon"
  ],
  video: "https://www.w3schools.com/html/mov_bbb.mp4",
  views: 2568,
  likes: 123,
  isLiked: false,
  comments: [
    {
      id: 1,
      author: {
        name: "AI_PHOTOGRAPHER",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg"
      },
      text: "红外滤镜参数可以分享吗？",
      createdAt: "2024-03-20T09:30:00"
    }
  ]
})

// 评分逻辑
const currentRating = ref(3)
const ratingTexts = ['POOR', 'AVERAGE', 'GOOD', 'GREAT', 'AMAZING']
const ratingText = computed(() => currentRating.value ? ratingTexts[currentRating.value - 1] : 'CLICK TO RATE')

const rateDiary = (rating) => {
  currentRating.value = rating
}

// 评论逻辑
const newComment = ref('')
const postComment = () => {
  if (!newComment.value.trim()) return
  
  diary.value.comments.push({
    id: Date.now(),
    author: {
      name: "CYBER_USER",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg"
    },
    text: newComment.value,
    createdAt: new Date().toISOString()
  })
  newComment.value = ''
}

// 点赞逻辑
const handleLike = () => {
  diary.value.likes += diary.value.isLiked ? -1 : 1
  diary.value.isLiked = !diary.value.isLiked
}

// 日期格式化
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

const scrollToComments = () => {
  document.getElementById('comments').scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  })
}
</script>

<style lang="scss" scoped>
/* Dolby 风格变量 */
:root {
  --dolby-black: #0A0A0A;
  --dolby-blue: #006FFF;
  --dolby-cyan: #00F0FF;
  --dolby-gray: #1A1A1A;
  --neon-pink: #FF2D55;
}

.diary-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3.5rem;
  background: var(--dolby-black);
  color: #fff;
  font-family: 'Segoe UI', system-ui;

  .title {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: black;
    text-shadow: 0 0 15px rgba(0, 136, 255, 0.8);
    letter-spacing: -0.5px;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 3rem;

    .neon-avatar {
      border: 2px solid rgba(0, 136, 255, 0.8);
      box-shadow: 0 0 12px rgba(0, 136, 255, 0.8);
    }

    .info {
      .username {
        font-size: 1.1rem;
        color: black;
        margin-bottom: 0.5rem;
      }
      .date {
        color: #7F7F7F;
        font-size: 0.8rem;
      }
    }
  }

  .media-container {
    display: grid;
    gap: 1.5rem;
    margin: 3rem 0;

    .media-card {
      @extend .card-effect;
      padding: 13px;
    }

    .card-image, .card-video {
      width: 100%;
      height: 50vh;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  .content {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #000000;
    margin: 1rem 0;
    padding: 2rem;
    background:whitesmoke;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .action-bar {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 1.5rem 0;
    border-top: 1px solid rgba(255,255,255,0.1);

    .view-count {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #7F7F7F;

      .view-icon {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }
    }

    .neon-like {
      transition: all 0.3s;
      &:hover {
        filter: drop-shadow(0 0 8px var(--neon-pink));
      }
    }
  }

  .rating-section {
    padding-left: 1.4rem;
    margin: 3rem 0;
    background-color: #0071e3;

    h3 {
      color: var(--dolby-cyan);
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .star-rating {
      display: flex;
      gap: 0.8rem;

      .star {
        width: 32px;
        height: 32px;
        background: white;
        clip-path: polygon(
          50% 0%,
          61% 35%,
          98% 35%,
          68% 57%,
          79% 91%,
          50% 70%,
          21% 91%,
          32% 57%,
          2% 35%,
          39% 35%
        );
        cursor: pointer;
        transition: all 0.3s;

        &.active {
          background: rgb(251, 200, 3);
          box-shadow: 0 0 12px rgba(0, 111, 255, 0.5);
        }

        &:hover {
          transform: scale(1.2);
        }
      }
    }

    .rating-text {
      margin-top: 1rem;
      color: var(--dolby-cyan);
      font-size: 1.1rem;
    }
  }

  .comments-section {
    padding: 1.5rem;

    h2 {
      color: black;
      margin-bottom: 2rem;
      font-size: 1.5rem;
    }

    .comment-item {
      display: flex;
      gap: 1.5rem;
      padding: 1.4rem;
      margin-bottom: 1.5rem;
      background-color: #0071e3;
      border-radius: 8px;
      border: 1px solid rgb(115, 255, 246);

      .comment-content {
        .username {
          color: rgb(227, 227, 227);
          margin-bottom: 0.3rem;  /* 减少间距 */
          margin-top: -0.3rem;     /* 可选：微调顶部间距 */
        }
        .text {
          color: rgb(255, 253, 253);
          line-height: 1.6;
        }
        .date {
          color: #b7b7b7;
          font-size: 0.9rem;
        }
      }
    }

    .neon-input {
      width: 490px;
      height: 120px;
      padding: 1rem;
      background: #0071e3;
      border: 1px solid rgb(115, 255, 246);
      border-radius: 8px;
      color: white;
      resize: vertical;
      transition: all 0.3s;

      &:focus {
        box-shadow: 0 0 12px rgba(0, 111, 255, 0.3);
      }
    }

    .neon-input::placeholder {
      color: rgba(255, 255, 255, 0.6) !important;
    }

    .neon-button {
      margin-top: 1rem;
      padding: 0.8rem 2rem;

      color: white;
      background-color: #0071e3;
      border: none;
      border-radius: 2rem;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: var(--dolby-cyan);
        background-color: #0261c1;
        box-shadow: 0 0 15px rgba(0, 240, 255, 0.8);
      }
    }
  }
}

/* 全局卡片效果 */
.card-effect {
  
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 
    0 4px 24px rgba(0,0,0,0.4),
    0 0 1px rgba(255,255,255,0.1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 8px 32px rgba(0,111,255,0.2),
      0 0 2px rgba(0,240,255,0.5);
  }
}

@media (max-width: 768px) {
  .diary-detail {
    padding: 1rem;
    
    .title {
      font-size: 1.8rem;
    }
    
    .media-container {
      .card-image, .card-video {
        height: 42vh;
      }
    }
    
    .content {
      padding: 1rem;
    }
  }
}
</style>