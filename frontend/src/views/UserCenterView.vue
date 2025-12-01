<template>
  <div class="app-page profile-page" v-if="user">
    <!-- 顶部个人信息卡片 -->
    <section class="profile-header">
      <div class="profile-header-inner">
        <div class="profile-main">
          <div class="avatar-large">
            {{ user.nickname?.[0] || 'U' }}
          </div>

          <div class="profile-info">
            <h1 class="profile-name">{{ user.nickname }}</h1>
            <p class="profile-sub">
              {{ user.email || '尚未填写邮箱' }}
            </p>

            <!-- 显示个性签名 -->
            <p class="profile-signature">
              <strong>个性签名：</strong>{{ user.signature || '没有设置个性签名' }}
            </p>

            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">{{ myPosts.length }}</span>
                <span class="stat-label">作品数</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">2.0</span>
                <span class="stat-label">系统版本</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">正常</span>
                <span class="stat-label">账号状态</span>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-actions">
          <RouterLink to="/create" class="btn-outline">
            去发布新作品
          </RouterLink>
          <RouterLink to="/profile/edit" class="btn-outline btn-secondary">
            编辑资料
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 我的作品列表 -->
    <section class="profile-content-card">
      <div class="profile-content-header">
        <h2>我的作品</h2>
        <span class="count-hint">共 {{ myPosts.length }} 个</span>
      </div>

      <!-- 状态提示 -->
      <div v-if="loading" class="status status--info">
        正在加载你的作品…
      </div>
      <div v-else-if="error" class="status status--error">
        {{ error }}
      </div>
      <div v-else-if="myPosts.length === 0" class="status status--empty">
        你还没有发布任何作品，试试点击右上角「创作」来发布第一张图片吧～
      </div>

      <!-- 作品卡片网格 -->
      <div v-else class="post-grid">
        <article
          v-for="post in myPosts"
          :key="post.id"
          class="post-card"
          @click="goToDetail(post.id)"
        >
        
          <div class="post-cover-wrapper">
            <img
              v-if="post.image_url"
              class="post-cover"
              :src="getImageUrl(post.image_url)"
              :alt="post.title"
            />
            <div v-else class="post-cover-placeholder">
              无封面图片
            </div>
          </div>
            <!-- ✅ 新增：右上角删除按钮 -->
        <button
          class="post-delete-btn"
          @click.stop="handleDeletePost(post.id)"
          :disabled="deletingId === post.id"
        >
        {{ deletingId === post.id ? '删除中…' : '删除' }}
        </button>

          <div class="post-body">
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-desc">
              {{ post.description || '该作品没有填写描述。' }}
            </p>

            <div class="post-meta">
              <span class="post-date">
                {{ formatTime(post.created_at) }}
              </span>
              <span class="post-stats">
                💬 {{ post.comment_count ?? 0 }} 条评论
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>

  <!-- 没有登录时的兜底提示（正常情况下会被重定向到登录页） -->
  <div v-else class="status" style="margin-top: 80px;">
    请先登录…
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute  } from 'vue-router';
import authStore from '../store/auth';
import { fetchPostsByAuthor } from '../api/posts';
import { deletePostById } from '../api/posts'; 
import { fetchUserById } from '../api/auth';   // ✅ 新增：按 id 获取用户信息

const router = useRouter();
const route = useRoute();
// 当前用户（来自登录状态）
const authUser = computed(() => authStore.state.user);
// 正在查看的这个用户（可能是自己，也可能是别人
const user = ref(null);

const profileUserId = computed(() => {
  const idFromRoute = route.params.id;
  if (idFromRoute) return Number(idFromRoute);   // URL 里带的作者 id
  return authUser.value?.id ?? null;             // 没带就看自己的
});



// 我的作品列表
const myPosts = ref([]);
const loading = ref(false);
const error = ref('');
const deletingId = ref(null);  

// 拼接图片 URL
const getImageUrl = (path) =>
  path && path.startsWith('http')
    ? path
    : `http://localhost:3000${path || ''}`;

// 时间格式化
const formatTime = (t) => (t ? new Date(t).toLocaleString('zh-CN') : '');

// 加载当前用户的作品
async function loadMyPosts() {
  if (!authUser.value) return;// 没登录就别加载
  const targetId = profileUserId.value; // 要查看的这个用户 id
  if (!targetId) return;

  loading.value = true;
  error.value = '';

  try {
    // 1. 先确定 user（是自己就用 authUser，否则向后端要）
    if (authUser.value.id === targetId) {
      user.value = authUser.value;  // 使用已登录的用户数据
    } else {
      // 获取指定 ID 用户的信息
      user.value = await fetchUserById(targetId);
    }
    // 2. 再加载这个用户的作品列表
    const data = await fetchPostsByAuthor(targetId);
    myPosts.value = data;
  } catch (err) {
    console.error(err);
    error.value = '加载你的作品失败，请稍后重试。';
  } finally {
    loading.value = false;
  }
}

// 跳转到作品详情
function goToDetail(id) {
  router.push(`/posts/${id}`);
}

// 删除某条作品
async function handleDeletePost(postId) {
  if (!user.value) return;
  // 确保是当前用户的作品才可以删除
  if (authUser.value.id !== user.value.id) {
    alert('你不能删除别人的作品！');
    return;  // 如果是其他人的作品，直接返回
  }


  const ok = window.confirm('确定要删除这条作品吗？删除后将无法恢复。');
  if (!ok) return;

  deletingId.value = postId;
  try {
    // 调用后端删除接口
    const res = await deletePostById(postId, user.value.id);
    console.log('delete result:', res);
        // 从当前列表中移除这条
    myPosts.value = myPosts.value.filter(p => p.id !== postId);

  } catch (e) {
    console.error('delete error:', e?.response || e);
    alert(e?.response?.data?.message || '删除失败，请稍后重试');
  } finally {
    deletingId.value = null;
  }
}


onMounted(() => {
  // 如果没有指定用户 id 或者未登录，跳转到登录页
  if (!authUser.value) {
    router.push('/login');
    return;
  }
  loadMyPosts();
});

// 监听路由变化，切换用户时重新加载数据
watch(
  () => route.params.id,
  () => {
    if (!authUser.value) return;
    loadMyPosts();
  }
);


</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 顶部个人信息卡片 */
.profile-header {
  margin-bottom: 4px;
}

.profile-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  padding: 20px 24px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(186, 230, 253, 0.9), rgba(221, 214, 254, 0.96));
  box-shadow: 0 14px 40px rgba(148, 163, 184, 0.55);
  backdrop-filter: blur(10px);
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 18px;
}

.avatar-large {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #ffffff, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f9fafb;
  font-size: 32px;
  font-weight: 700;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.55);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.profile-sub {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
}

.profile-stats {
  margin-top: 6px;
  display: flex;
  gap: 18px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.profile-actions {
  display: flex;
  align-items: center;
}

.btn-outline {
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid #2563eb;
  background: rgba(255, 255, 255, 0.9);
  color: #2563eb;
  font-size: 14px;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
}

/* 内容卡片：作品列表 */
.profile-content-card {
  margin-top: 4px;
  background: #ffffff;
  border-radius: 20px;
  padding: 18px 22px 22px;
  box-shadow: 0 14px 40px rgba(148, 163, 184, 0.5);
}

.profile-content-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.profile-content-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.count-hint {
  font-size: 13px;
  color: #6b7280;
}

/* 状态提示 */
.status {
  text-align: center;
  padding: 32px 10px;
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

/* 作品网格 & 卡片：和首页保持同一风格 */
.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 16px;
}

.post-card {
  background: #f9fafb;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 26px rgba(148, 163, 184, 0.5);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  position: relative;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(148, 163, 184, 0.7);
}

/* ✅ 新增：卡片右上角的小删除按钮 */
.post-delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 999px;
  border: none;
  background: rgba(239, 68, 68, 0.92);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
  z-index: 2;    
}

.post-delete-btn:hover:not(:disabled) {
  background: rgba(220, 38, 38, 1);
}

.post-delete-btn:disabled {
  opacity: 0.7;
  cursor: default;
}

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

.post-body {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.post-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.post-desc {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  max-height: 38px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-meta {
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #9ca3af;
}

.post-stats {
  color: #6b7280;
}
.profile-signature {
  font-size: 14px;
  color: #4b5563;
  margin-top: 8px;
  padding-left: 10px;
  border-left: 4px solid #2563eb;
}


@media (max-width: 768px) {
  .profile-header-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-main {
    width: 100%;
  }


  .profile-actions {
    align-self: stretch;
    justify-content: flex-end;
  }
}
</style>
