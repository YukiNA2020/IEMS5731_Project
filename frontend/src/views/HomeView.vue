<script setup>
// 这里是首页的逻辑部分（JS），负责：
// 1. 从后端加载作品列表
// 2. 在页面加载时自动请求数据
// 3. 点击卡片时跳转到详情页

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchAllPosts } from '../api/posts';

// 路由，用于编程式跳转（比如点击卡片跳到详情页）
const router = useRouter();

// posts：作品列表数据（数组）
const posts = ref([]);
// loading：是否正在加载，用于显示“加载中”的提示
const loading = ref(false);
// error：加载失败时的错误信息
const error = ref('');

// ✅ 新增：搜索框内容
const searchText = ref('');

// 从后端加载作品列表的函数
async function loadPosts(params = {}) {
  loading.value = true;  // 开始加载
  error.value = '';

  try {
    const data = await fetchAllPosts(params); // 调用你封装好的 API
    posts.value = data;
  } catch (err) {
    console.error(err);
    error.value = '加载作品列表失败，请稍后重试。';
  } finally {
    loading.value = false; // 无论成功失败，都结束“加载中”状态
  }
}

// ✅ 新增：点击“搜索”或回车时触发
function handleSearch() {
  const keyword = searchText.value.trim();
  if (!keyword) {
    // 输入空字符串 = 还原到全部作品
    loadPosts();
  } else {
    loadPosts({ search: keyword });
  }
}

// 点击某个作品卡片时，跳转到详情页
function goToDetail(id) {
  router.push(`/posts/${id}`);
}

// 组件挂载（页面第一次显示）时，自动加载一次数据
onMounted(loadPosts);
</script>

<template>
  <!-- 外层容器，控制整体宽度和布局 -->
  <div class="app-page home-page">
    <!-- 顶部的“横幅”区域，让页面不那么空 -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">作品列表（首页）</h1>
          <p class="hero-subtitle">
            这里展示所有已经发布的图片作品，你可以点击卡片进入详情页查看大图和评论。
          </p>
        </div>

        <div class="hero-extra">
        <!-- 互动数量 -->
          <div class="hero-count">互动作品数：{{ posts.length }}</div>

          <!-- 搜索表单 -->
            <form class="hero-search" @submit.prevent="handleSearch">
            <input
              v-model="searchText"
              class="hero-search-input"
              type="text"
              placeholder="输入关键词搜索"
            />
            <button class="hero-search-btn" type="submit">搜索</button>
          </form>
        </div>
      </div>
    </section>

    <!-- 中间白色卡片区域，用于包裹作品列表 -->
    <section class="content-card">
      <!-- 加载状态 -->
      <div v-if="loading" class="status status--info">
        正在加载作品...
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="status status--error">
        {{ error }}
      </div>

      <!-- 没有任何作品 -->
      <div v-else-if="posts.length === 0" class="status status--empty">
        目前还没有任何作品，请先在“创作”页面上传一张图片。
      </div>

      <!-- 正常的作品网格列表 -->
      <div v-else class="post-grid">
        <!-- 逐个渲染作品卡片 -->
        <article
          v-for="post in posts"
          :key="post.id"
          class="post-card"
          @click="goToDetail(post.id)"
        >
          <!-- 封面图片区域 -->
          <div class="post-cover-wrapper">
            <img
              v-if="post.image_url"
              class="post-cover"
              :src="`http://localhost:3000${post.image_url}`"
              :alt="post.title"
            />
            <div v-else class="post-cover-placeholder">
              无封面图片
            </div>
          </div>

          <!-- 文本信息区域 -->
          <div class="post-body">
            <h2 class="post-title">{{ post.title }}</h2>

            <p class="post-desc">
              {{ post.description || '该作品没有填写描述。' }}
            </p>

            <div class="post-meta">
              <div class="post-author">
                <span class="post-author-avatar">
                  {{ (post.author_nickname || '作者')[0] }}
                </span>
                <div class="post-author-info">
                  <span class="post-author-name">
                    {{ post.author_nickname || '未知作者' }}
                  </span>
                  <span class="post-date">
                    {{ new Date(post.created_at).toLocaleString() }}
                  </span>
                </div>
              </div>

              <div class="post-stats">
                <!-- 评论数来自后端的 comment_count 字段，如果没有则默认 0 -->
                💬 {{ post.comment_count ?? 0 }} 条评论
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
<style scoped>
/* 整个首页宽度控制：和登录/注册保持一致 */
.home-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px 48px;
  box-sizing: border-box;
}

/* 顶部横幅区域 */
.hero {
  margin-bottom: 18px;
}

/* 渐变背景 + 光晕效果 */
.hero-inner {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  padding: 18px 28px;
  border-radius: 24px;

  /* 更接近图一的紫蓝渐变 */
  background: linear-gradient(90deg, #1848e4, #9cbbebe0, #fdfeffe0);
  box-shadow: 0 20px 45px rgba(128, 186, 240, 0.45);
  overflow: hidden;
}

/* 背景发光层（轻微的模糊圆光） */
.hero-inner::before {
  content: "";
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle at 0 0, rgba(255, 255, 255, 0.28), transparent 55%),
              radial-gradient(circle at 100% 0, rgba(255, 255, 255, 0.16), transparent 60%);
  opacity: 0.8;
  pointer-events: none;
}

/* 让文字内容浮在发光层之上 */
.hero-text,
.hero-extra {
  position: relative;
  z-index: 1;
}

.hero-text {
  max-width: 70%;
}

/* 标题白色，加粗一点 */
.hero-title {
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
}

/* 副标题也改成白色/浅灰 */
.hero-subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(249, 250, 251, 0.9);
  line-height: 1.7;
}

/* 右侧统计信息 */
.hero-extra {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

/* “互动作品数”小胶囊 */
.hero-count {
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.88);
  color: #4b5563;
  box-shadow: 0 4px 12px rgba(51, 111, 252, 0.25);
}



/* ===== 白色内容卡片，里面是作品列表 ===== */
.content-card {
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 20px 22px 26px;
  box-shadow: 0 22px 55px rgba(148, 163, 184, 0.55);
  border: 1px solid rgba(209, 213, 219, 0.6);
}

/* 状态提示（加载中 / 错误 / 空） */
.status {
  text-align: center;
  padding: 30px 10px;
  font-size: 14px;
}

.status--info {
  color: #2563eb;
}

.status--error {
  color: #b91c1c;
}

.status--empty {
  color: #6b7280;
}
/* 🌟 精美搜索框：胶囊形状 + 半透明白底 + 柔和阴影 */
.hero-search {
  display: flex;
  align-items: center;
  gap: 8px;
  
  padding: 8px 12px;
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(6px);

  box-shadow: 
    0 6px 16px rgba(148, 163, 184, 0.35),
    0 0 10px rgba(255, 255, 255, 0.25);

  transition: all 0.25s ease;
}

.hero-search:hover {
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 8px 28px rgba(148, 163, 184, 0.45),
    0 0 10px rgba(255, 255, 255, 0.4);
}

/* 🌟 输入框（透明风 + 圆角 + 内阴影） */
.hero-search-input {
  flex: 1;
  border: none;
  outline: none;

  background: transparent;
  color: #1f2937;
  font-size: 14px;

  padding: 6px 4px;

  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
  transition: all 0.2s ease;
}

.hero-search-input:focus {
  border-bottom: 1px solid #2563eb;
}

/* 🌟 搜索按钮（渐变 + 上浮 + 阴影） */
.hero-search-btn {
  padding: 6px 16px;
  font-size: 13px;

  border: none;
  border-radius: 999px;
  
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  font-weight: 500;

  cursor: pointer;

  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);

  transition: all 0.2s ease;
}

.hero-search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.45);
  background: linear-gradient(135deg, #60a5fa, #2563eb);
}

.hero-search-btn:active {
  transform: translateY(0);
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.3);
}
/* 作品网格布局 */
.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

/* 单个作品卡片：圆角更大、阴影更柔和一点 */
.post-card {
  background: #f9fafb;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  
  box-shadow:
  0 8px 24px rgba(117, 160, 241, 0.397),  
  0 4px 12px rgba(15, 103, 236, 0.459),  
  0 0 18px rgba(255, 255, 255, 0.4);    

  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

/* 悬停略微上浮 */
.post-card:hover {
  transform: translateY(-4px);
  box-shadow:
  0 14px 32px rgba(99, 102, 241, 0.32),  
  0 8px 20px rgba(168, 85, 247, 0.28),   
  0 0 28px rgba(255, 255, 255, 0.55);   
}

/* 封面图片区域：保持横向长图比例 */
.post-cover-wrapper {
  position: relative;
  padding-top: 60%;
  background: #e5e7eb;
}

.post-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-cover-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 13px;
}

/* 卡片底部文本部分 */
.post-body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.post-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.post-desc {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;

  max-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 底部 meta 部分：作者 + 评论数 */
.post-meta {
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-author-avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #4338ca;
}

.post-author-info {
  display: flex;
  flex-direction: column;
}

.post-author-name {
  font-size: 13px;
  font-weight: 500;
}

.post-date {
  font-size: 11px;
  color: #9ca3af;
}

.post-stats {
  font-size: 12px;
  color: #6b7280;
}

/* 响应式：窄屏时横幅改为竖排 */
@media (max-width: 768px) {
  .home-page {
    padding: 20px 10px 32px;
  }

  .hero-inner {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 18px;
  }

  .hero-text {
    max-width: 100%;
  }

  .hero-extra {
    align-items: flex-start;
  }
}
</style>
