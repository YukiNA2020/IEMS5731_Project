<!-- frontend/src/views/EditProfileView.vue -->
<template>
  <div class="app-page edit-profile-page" v-if="user">
    <section class="edit-card">
      <header class="edit-header">
        <h1>编辑个人资料</h1>
        <p>你可以在这里修改昵称和个性签名。</p>
      </header>

      <form class="edit-form" @submit.prevent="handleSubmit">
        <label class="form-item">
          <span class="label">昵称</span>
          <input
            v-model="nickname"
            type="text"
            placeholder="请输入你的昵称"
            required
          />
        </label>

        <label class="form-item">
          <span class="label">个性签名（可选）</span>
          <textarea
            v-model="signature"
            rows="3"
            placeholder="写一句话介绍你自己吧～"
          ></textarea>
        </label>

        <div class="form-actions">
          <button
            type="button"
            class="btn-ghost"
            @click="goBack"
            :disabled="loading"
          >
            取消
          </button>

          <button
            type="submit"
            class="btn-primary"
            :disabled="loading"
          >
            {{ loading ? '保存中…' : '保存修改' }}
          </button>
        </div>

        <p v-if="message" class="msg">{{ message }}</p>
        <p v-if="error" class="msg msg-error">{{ error }}</p>
      </form>
    </section>
  </div>

  <!-- 没登录的兜底（正常情况会被重定向） -->
  <div v-else class="status" style="margin-top: 80px;">
    请先登录后再编辑个人资料…
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authStore from '../store/auth';
import { updateUserProfile } from '../api/auth';

const router = useRouter();

// 当前登录用户
const user = computed(() => authStore.state.user);

// 表单数据
const nickname = ref('');
const signature = ref('');

// 状态
const loading = ref(false);
const message = ref('');
const error = ref('');

// 初始化表单
onMounted(() => {
  if (!user.value) {
    router.push('/login');
    return;
  }
  nickname.value = user.value.nickname || '';
  signature.value = user.value.signature || '';
});

// 返回个人中心
function goBack() {
  router.push('/profile');
}

// 提交保存
async function handleSubmit() {
  if (!user.value) return;

  const name = nickname.value.trim();
  if (!name) {
    error.value = '昵称不能为空';
    return;
  }

  loading.value = true;
  message.value = '';
  error.value = '';

  try {
    const res = await updateUserProfile(user.value.id, {
      nickname: name,
      signature: signature.value.trim(),
    });

    // 用后端返回的最新 user 覆盖本地登录状态
    if (res?.user) {
      authStore.setUser(res.user);
    }

    message.value = '保存成功！';
    // 稍微等一下再跳回去 – 也可以直接跳
    setTimeout(() => {
      router.push('/profile');
    }, 600);
  } catch (e) {
    console.error(e);
    error.value = e?.response?.data?.message || '保存失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.edit-profile-page {
  max-width: 640px;
  margin: 40px auto;
}

.edit-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 22px 26px 26px;
  box-shadow: 0 22px 55px rgba(148, 163, 184, 0.5);
  border: 1px solid rgba(209, 213, 219, 0.6);
}

.edit-header h1 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.edit-header p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.edit-form {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 14px;
  color: #4b5563;
}

input,
textarea {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  outline: none;
  resize: vertical;
}

input:focus,
textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.15);
}

.form-actions {
  margin-top: 4px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary,
.btn-ghost {
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.btn-ghost {
  background: #f9fafb;
  color: #374151;
  border-color: #e5e7eb;
}

.btn-primary:disabled,
.btn-ghost:disabled {
  opacity: 0.7;
  cursor: default;
}

.msg {
  margin-top: 6px;
  font-size: 13px;
  color: #16a34a;
}

.msg-error {
  color: #b91c1c;
}
</style>
