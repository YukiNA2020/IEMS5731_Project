<!-- frontend/src/App.vue -->
<template>
  <div class="app-root">
    <header class="top-nav">
      <div class="nav-left" @click="goHome">
        <span class="logo">NicheCraft Hub</span>
      </div>
      <nav class="nav-links">
        <RouterLink to="/">首页</RouterLink>
        <router-link v-if="user" to="/create">创作</router-link>
        
        <template v-if="!user">
        
          <RouterLink to="/login">登录</RouterLink>
          <RouterLink to="/register">注册</RouterLink>
        </template>

        <template v-else>
        <!-- ✅ 修改这里：span -> RouterLink，点击跳个人中心 -->
          <RouterLink to="/profile" class="user-info-link">
            你好，{{ user.nickname }}
          </RouterLink>
          
          <button class="logout-btn" @click="handleLogout">退出</button>
        </template>
      </nav>
    </header>

    <main class="page-container">
      <RouterView />
    </main>
  </div>
</template>






<script setup>
import { computed } from 'vue';
import { useRouter, RouterLink, RouterView } from 'vue-router';
import authStore from './store/auth';

// Vue Router 实例
const router = useRouter();

// 响应式获取当前用户
const user = computed(() => authStore.state.user);

// 返回首页
function goHome() {
  router.push('/');
}

// 退出登录
function handleLogout() {
  authStore.setUser(null);   // 清空登录状态
  router.push('/');
}
</script>

<style>
.app-root {
  min-height: 100vh;
  background: #f4f4f5;
  display: flex;
  flex-direction: column;

  background-image: url('/snow.png'); /* ⬅⬅⬅ 换成你自己的图片路径 */
  background-repeat: no-repeat;
  background-size: cover;         /* 拉伸铺满 */
  background-position: top center;
  background-attachment: fixed;   /* 页面滚动时背景保持不动，可按喜好删掉 */
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 40px;
  
  background: rgba(255, 255, 255, 0.22);     /* 透明度可以自己调 0.15 ~ 0.35 */
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18);

}

.logo {
  font-weight: 600;
  cursor: pointer;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-links a {
  text-decoration: none;
  color: #52525b;
}

.nav-links a.router-link-active {
  color: #2563eb;
  font-weight: 600;
}

.user-info {
  font-size: 14px;
  color: #2563eb;
}
.nav-left {
  display: flex;
  align-items: center;
}

.logout-btn {
  border: none;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  font-size: 14px;
}

.page-container {
  flex: 1;   
  justify-content: center;
  padding: 6px 0 8px;
}

.user-info-link {
  font-size: 14px;
  color: #2563eb;
  cursor: pointer;
}

.user-info-link.router-link-active {
  /* 个人中心高亮时的样式 */
  font-weight: 600;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .top-nav-inner {
    padding: 8px 12px;
  }
}
</style>
