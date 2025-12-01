
<template>
  <!-- 整个注册页面容器：负责把卡片居中摆放 -->
  <div class="register-page">
    <!-- 半透明注册卡片 -->
    <div class="register-card">

      <!-- 顶部蓝色标题条（风格与登录页一致） -->
      <div class="register-header">
        注册账号
      </div>

      <!-- 主体内容 -->
      <div class="register-body">
        <form @submit.prevent="handleRegister" class="register-form">
          <!-- 邮箱 -->
          <div class="field">
            <label>邮箱：</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="输入邮箱"
            />
          </div>

          <!-- 密码 -->
          <div class="field">
            <label>密码：</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="输入密码"
            />
          </div>

          <!-- 昵称 -->
          <div class="field">
            <label>昵称：</label>
            <input
              v-model="nickname"
              type="text"
              required
              placeholder="输入昵称"
            />
          </div>

          <!-- 注册按钮 -->
          <button type="submit" class="submit-btn">
            注册
          </button>
        </form>

        <!-- 注册结果提示信息（逻辑保持不变） -->
        <p class="msg" v-if="message">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

const API_BASE = "http://localhost:3000/api";

export default {
  data() {
    return {
      email: "",
      password: "",
      nickname: "",
      message: "",
    };
  },
  methods: {
    async handleRegister() {
      try {
        const res = await axios.post(`${API_BASE}/auth/register`, {
          email: this.email,
          password: this.password,
          nickname: this.nickname,
        });

        this.message = "注册成功！正在跳转到登录页…";

        // 1 秒后跳转登陆
        setTimeout(() => {
          this.$router.push("/login");
        }, 1000);

      } catch (err) {
        this.message = "注册失败：" + err.response?.data?.message || "服务器错误";
      }
    },
  },
};
</script>



<style scoped>
/* ===== 页面布局：与登录页保持一致 ===== */
/* ✅ 重大修改：
   - 去掉原来的 background: #f5f7fb，防止盖住全局雪景背景
   - 不再用 min-height 抢占整屏，而是控制内容宽度 + 居中 */
.register-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);  /* 大概扣掉导航高度，让卡片垂直适配屏幕 */
  padding-top: 40px;

  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
}

/* 半透明玻璃卡片（风格和 Login 的 login-card 对齐） */
.register-card {
  width: 480px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.15);
}

/* 顶部蓝色标题条 */
.register-header {
  background: linear-gradient(90deg, #1848e4, #3860e6, #758cda);
  padding: 18px 0;
  text-align: center;
  font-size: 22px;
  letter-spacing: 3px;
  font-weight: 600;
  color: #ffffff;
}

/* 主内容区域 */
.register-body {
  padding: 28px 40px 32px;
}

/* ===== 表单样式（跟登录页的 field 风格一致） ===== */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  font-size: 14px;
  color: #0f172a;
  margin-bottom: 6px;
}

/* 输入框用“底部细线”风格，配合玻璃卡片更简洁 */
.field input {
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(30, 64, 175, 0.4);
  padding: 8px 4px;
  font-size: 15px;
  outline: none;
}

.field input:focus {
  border-bottom-color: #2563eb;
}

/* 注册按钮：白底蓝字，和登录页的按钮统一 */
.submit-btn {
  margin-top: 4px;
  width: 100%;
  padding: 12px 0;
  border: none;
  border-radius: 6px;

  background: #ffffff;
  color: #2563eb;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(30, 64, 175, 0.25);
}

.submit-btn:hover {
  background: #f1f5ff;
}

/* 提示信息（注册成功/失败） */
.msg {
  margin-top: 16px;
  font-size: 14px;
  color: #4b5563;
  text-align: center;
}

/* 简单的手机适配 */
@media (max-width: 768px) {
  .register-page {
    padding-top: 24px;
  }

  .register-card {
    width: 100%;
    max-width: 480px;
  }

  .register-body {
    padding: 20px 18px 26px;
  }
}
</style>