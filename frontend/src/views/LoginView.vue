<!-- frontend/src/views/LoginView.vue -->
<!-- frontend/src/views/LoginView.vue -->
<template>
  <div class="login-page">
    <div class="login-card">

      <!-- 顶部蓝色标题条 -->
      <div class="login-header">
        用户登录
      </div>

      <!-- 主体内容 -->
      <div class="login-body">

        <form class="login-form" @submit.prevent="handleSubmit">

          <!-- 邮箱 -->
          <div class="field">
            <label>邮箱</label>
            <input
              v-model="email"
              type="email"
              placeholder="请输入注册时使用的邮箱"
            />
          </div>

          <!-- 密码 -->
          <div class="field">
            <label>密码</label>
            <input
              v-model="password"
              type="password"
              placeholder="请输入密码"
            />
          </div>

          <p v-if="errorMessage" class="form-error">
            {{ errorMessage }}
          </p>

          <!-- 登录按钮 -->
          <button class="btn-login" type="submit" :disabled="loading">
            {{ loading ? '登录中...' : '登 录' }}
          </button>
        </form>

        <p class="to-register">
          还没有账号？
          <RouterLink to="/register">去注册</RouterLink>
        </p>

      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { login } from '../api/auth';
import authStore from '../store/auth';

const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleSubmit() {
  errorMessage.value = '';

  if (!email.value || !password.value) {
    errorMessage.value = '请填写邮箱和密码';
    return;
  }

  loading.value = true;
  try {
    // 调用后端登录接口
    const user = await login(email.value, password.value);

    // 保存用户到“仓库”和 localStorage
    authStore.setUser(user);

    // 跳转回首页
    router.push('/');
  } catch (err) {
    console.error('Login error', err);
    errorMessage.value =
      err?.response?.data?.message || '登录失败，请检查邮箱或密码';
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped>
/* 最外层布局：全屏居中 */
.login-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
  padding-top: 40px;

  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* 登录卡片（整体透明玻璃效果） */
.login-card {
  width: 480px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);

  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.15);
}

/* 顶部蓝色大条 */
.login-header {
  
  background: linear-gradient(90deg, #1848e4, #3860e6, #758cda);
  padding: 18px 0;
  text-align: center;
  font-size: 22px;
  letter-spacing: 3px;
  font-weight: 600;
  color: white;
}

/* 主内容区 */
.login-body {
  padding: 28px 40px 35px;
}

/* 输入区域 */
.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.field label {
  color: #0f172a;
  font-size: 14px;
  margin-bottom: 6px;
}

/* 输入框改为 “底部细线” 风格（更现代） */
.field input {
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(30, 64, 175, 0.4); /* 蓝色细线 */
  padding: 8px 4px;
  font-size: 15px;
  outline: none;
}

.field input:focus {
  border-bottom-color: #2563eb;
}

/* 错误提示 */
.form-error {
  margin-top: -8px;
  margin-bottom: 12px;
  color: #dc2626;
  font-size: 14px;
}

/* 登录按钮（大白按钮蓝字） */
.btn-login {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-radius: 6px;

  background: white;
  color: #2563eb;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(30, 64, 175, 0.25);
}

.btn-login:hover:not(:disabled) {
  background: #f1f5ff;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: default;
}

/* 去注册 */
.to-register {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
  color: #1e293b;
}

.to-register a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.to-register a:hover {
  text-decoration: underline;
}
</style>