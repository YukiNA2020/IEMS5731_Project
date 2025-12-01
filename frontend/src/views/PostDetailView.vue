<!-- frontend/src/views/PostDetailView.vue -->
<template>
  <!-- 整个详情页：居中放一张大卡片 -->
  <main class="detail-page" v-if="!loading && post">
    <section class="detail-shell">
      <!-- 顶部标题区域：左侧大标题 + 右侧小信息 -->
      <header class="detail-header">
        <div class="detail-header-left">
          <h1 class="detail-app-name">{{ post.title }}</h1>
          <div class="detail-id-row">
            
            <div class="detail-id-meta">
              <p>
                <span class="meta-label">作者</span>
                <RouterLink :to="`/profile/${post.author_id}`" class="meta-text">
                  {{ post.author_nickname || '未知用户' }}
                </RouterLink>
              </p>
              <p v-if="post.created_at">
                <span class="meta-label">发布时间</span>
                <span class="meta-text">{{ formatTime(post.created_at) }}</span>
              </p>
            </div>
          </div>
        </div>
        <div class="detail-header-right">
          <span class="detail-header-tag">作品详情</span>
        </div>
      </header>

      <!-- 主体内容：左边大图，右边简介 + 评论区 -->
      <div class="detail-main">
        <!-- 左侧：图片展示区 -->
        <div class="detail-left">
          <div class="image-frame">
            <div class="image-wrapper">
              <img
                v-if="post.image_url"
                :src="getImageUrl(post.image_url)"
                alt="作品封面"
              />
              <div v-else class="image-placeholder">No Image</div>
            </div>
          </div>
        </div>

        <!-- 右侧：简介 + 评论 -->
        <div class="detail-right">
          <!-- 作品简介 -->
          <section class="section section-intro">
            <h2 class="section-title">作品简介</h2>
            <p class="description">
              {{ post.description || '（暂无简介）' }}
            </p>
          </section>

          <!-- 分割线 -->
          <div class="section-divider"></div>

          <!-- 评论区 -->
          <section class="section section-comments">
            <h2 class="section-title">评论区</h2>

            <div v-if="commentsLoading" class="hint">正在加载评论…</div>
            <div v-else-if="commentsError" class="hint error">
              {{ commentsError }}
            </div>

            <ul v-else class="comment-list">
              <li v-if="comments.length === 0" class="hint">
                暂时还没有评论，来抢沙发吧～
              </li>
              <li
                v-for="comment in comments"
                :key="comment.id"
                class="comment-item"
              >
                <p class="comment-meta">
                  {{ comment.author_nickname || '匿名用户' }}
                  <span v-if="comment.created_at">
                    · {{ formatTime(comment.created_at) }}
                  </span>
                </p>
                <p class="comment-content">{{ comment.content }}</p>
              </li>
            </ul>

            <!-- 发表评论 -->
            <form class="comment-form" @submit.prevent="handleSubmitComment">
              <h3 class="comment-form-title">发表你的评论</h3>
              <textarea
                v-model="newComment"
                placeholder="说点什么吧…"
                rows="3"
              ></textarea>
              <button
                type="submit"
                :disabled="submitting || !newComment.trim()"
              >
                {{ submitting ? '提交中…' : '提交评论' }}
              </button>
            </form>
          </section>
        </div>
      </div>
    </section>
  </main>

  <!-- 加载 / 找不到 的提示保持不变 -->
  <div v-else class="hint" style="margin-top: 80px;">
    {{ loading ? '正在加载作品详情…' : '未找到该作品' }}
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchPostById } from '../api/posts';
import { fetchCommentsByPostId, createComment } from '../api/comments';

const route = useRoute();
const postId = Number(route.params.id);

// 作品详情
const post = ref(null);
const loading = ref(true);

// 评论相关
const comments = ref([]);
const commentsLoading = ref(true);
const commentsError = ref('');
const newComment = ref('');
const submitting = ref(false);

// 拼接图片完整 URL
const getImageUrl = (path) =>
  path && path.startsWith('http')
    ? path
    : `http://localhost:3000${path || ''}`;

// 简单时间格式化
const formatTime = (t) => new Date(t).toLocaleString('zh-CN');

// 初始化数据
onMounted(async () => {
  await Promise.all([loadPost(), loadComments()]);
});

async function loadPost() {
  loading.value = true;
  try {
    const data = await fetchPostById(postId);
    post.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function loadComments() {
  commentsLoading.value = true;
  commentsError.value = '';
  try {
    const data = await fetchCommentsByPostId(postId);
    comments.value = data;
  } catch (err) {
    console.error(err);
    commentsError.value = '加载评论失败，请稍后再试';
  } finally {
    commentsLoading.value = false;
  }
}

// 提交评论（暂时写死 userId = 1）
async function handleSubmitComment() {
  const content = newComment.value.trim();
  if (!content) return;

  submitting.value = true;
  try {
    const created = await createComment({
      workId: postId,
      userId: 1, // TODO：后面接登录状态
      content,
    });

    // 把新评论插到列表末尾（或开头都行）
    comments.value.push(created);
    newComment.value = '';
  } catch (err) {
    console.error(err);
    alert('提交评论失败，请稍后再试');
  } finally {
    submitting.value = false;
  }
}
</script>
<style scoped>
/* 整个详情页：让内容在中间的大卡片里显示 */
.detail-page {
  min-height: calc(100vh - 70px); /* 大致扣掉导航栏高度 */
  padding: 40px 16px 60px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* 中间的“玻璃卡片” */
.detail-shell {
  width: min(1120px, 100%);
  border-radius: 32px;
  padding: 26px 32px 30px;
  box-sizing: border-box;

  /* 冰蓝色磨砂玻璃效果 */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95),
    rgba(235, 245, 255, 0.93)
  );
  box-shadow:
    0 18px 40px rgba(148, 163, 184, 0.45),
    0 0 32px rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

/* 顶部：标题 + 作者信息 + 右上角小标签 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.detail-header-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-app-name {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #1f5ff5;
}

.detail-id-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.detail-id {
  font-size: 40px;
  font-weight: 800;
  color: #2563eb;
  letter-spacing: 1px;
}

.detail-id-meta p {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
}

.meta-label {
  margin-right: 4px;
  color: #6b7280;
}

.meta-text {
  font-weight: 500;
}

.detail-header-right {
  display: flex;
  align-items: center;
}

.detail-header-tag {
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 12px;
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

/* 主体：左图右文字，两栏布局 */
.detail-main {
  display: grid;
  grid-template-columns: minmax(0, 56%) minmax(0, 44%);
  gap: 28px;
}

/* 左侧：图片区域 */
.detail-left {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 外边再套一层边框，使图片像被“卡在面板里” */
.image-frame {
  padding: 8px;
  border-radius: 22px;
  background: linear-gradient(
    135deg,
    rgba(219, 234, 254, 0.9),
    rgba(239, 246, 255, 0.9)
  );
  box-shadow:
    0 10px 26px rgba(148, 163, 184, 0.4),
    0 0 18px rgba(255, 255, 255, 0.75);
}

/* 复用原来的 image-wrapper 名字，但改样式 */
.image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 65%; /* 比例图 */
  border-radius: 18px;
  overflow: hidden;
  background: #e5edf8;
}

.image-wrapper img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 14px;
}

/* 右侧：简介 + 评论 */
.detail-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 各个 section 的统一风格 */
.section {
  margin: 0;
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.section-intro .description {
  line-height: 1.7;
  font-size: 14px;
  color: #374151;
}

/* 介绍与评论之间的分割线 */
.section-divider {
  height: 1px;
  margin: 4px 0 6px;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0),
    rgba(148, 163, 184, 0.6),
    rgba(148, 163, 184, 0)
  );
}

/* 提示文字（加载 / 为空 / 错误） */
.hint {
  text-align: left;
  font-size: 13px;
  color: #6b7280;
}

.hint.error {
  color: #c0392b;
}

/* 评论列表 */
.comment-list {
  list-style: none;
  padding: 0;
  margin: 10px 0 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-item {
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(248, 250, 252, 0.95);
  box-shadow: 0 6px 14px rgba(148, 163, 184, 0.28);
}

.comment-meta {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.comment-content {
  font-size: 14px;
  color: #111827;
  margin: 0;
}

/* 发表评论表单 */
.comment-form {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-form-title {
  margin: 0;
  font-size: 14px;
  color: #374151;
}

.comment-form textarea {
  resize: vertical;
  min-height: 80px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #cbd5f5;
  font-size: 14px;
  outline: none;
  background: rgba(248, 250, 252, 0.96);
}

.comment-form textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.3);
}

/* 提交按钮：蓝色胶囊按钮 */
.comment-form button {
  align-self: flex-end;
  padding: 8px 24px;
  border-radius: 999px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.5);
}

.comment-form button:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}

.comment-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

/* 响应式：屏幕较窄时改为上下结构 */
@media (max-width: 900px) {
  .detail-shell {
    padding: 20px 18px 22px;
    border-radius: 24px;
  }

  .detail-main {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  .detail-id-row {
    gap: 12px;
  }

  .detail-id {
    font-size: 32px;
  }
}
</style>
