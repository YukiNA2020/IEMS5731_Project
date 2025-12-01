<template>
  <!-- 外层：让发布区域居中放在一张大卡片里 -->
  <main class="create-page">
    <section class="create-shell">
      <!-- 顶部标题区 -->
      <header class="create-header">
        <div>
          <h2 class="create-title">发布新作品</h2>
          <p class="create-subtitle">
            填写标题和简介，上传一张图片作为封面，就可以在首页展示你的作品啦～
          </p>
        </div>
      </header>

      <!-- 主体：左侧表单，右侧预览 -->
      <form class="create-main" @submit.prevent="handleSubmit">
        <!-- 左：表单区域 -->
        <div class="create-left">
          <div class="form-field">
            <label class="field-label">标题</label>
            <input
              v-model="title"
              required
              placeholder="作品标题"
              class="field-input"
            />
          </div>

          <div class="form-field">
            <label class="field-label">简介</label>
            <textarea
              v-model="description"
              rows="4"
              placeholder="简单介绍一下你的作品……"
              class="field-input field-textarea"
            ></textarea>
          </div>

          <div class="form-field">
            <label class="field-label">封面图片</label>
            <input
              type="file"
              accept="image/*"
              @change="onFileChange"
              class="field-file"
            />
            <p class="field-hint">支持常见图片格式，建议使用横图效果更佳，但图片大小需小于10MB。</p>
          </div>

          <button type="submit" class="submit-btn">
            发布
          </button>

          <p v-if="message" class="msg">{{ message }}</p>
        </div>

        <!-- 右：预览区域 -->
        <div class="create-right">
          <h3 class="preview-title">图片预览</h3>
          <div class="preview-card">
            <div v-if="previewUrl" class="preview-img-wrapper">
              <img :src="previewUrl" alt="预览图片" />
            </div>
            <div v-else class="preview-placeholder">
              选择一张图片后，这里会显示预览效果
            </div>
          </div>
        </div>
      </form>
    </section>
  </main>
</template>

<script>
import { createPost } from '../api/posts';

export default {
  data() {
    return {
      title: '',
      description: '',
      imageFile: null,
      previewUrl: '',
      message: '',
    };
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      this.imageFile = file || null;
      this.previewUrl = file ? URL.createObjectURL(file) : '';
    },

    async handleSubmit() {
      try {
        this.message = '正在发布中…';

        const post = await createPost({
          title: this.title,
          description: this.description,
          imageFile: this.imageFile,
        });

        this.message = '发布成功！正在跳转…';

        // 跳转到新作品详情页
        this.$router.push(`/posts/${post.id}`);
      } catch (err) {
        console.error(err);
        this.message =
          err.response?.data?.message || err.message || '发布失败';
      }
    },
  },
};
</script>

<style scoped>
/* 整个页面：让卡片居中，和其它页面保持一致的雪景 + 玻璃卡片风格 */
.create-page {
  min-height: calc(100vh - 70px); /* 粗略扣掉导航栏高度 */
  padding: 40px 16px 60px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* 中间的大卡片 */
.create-shell {
  width: min(1120px, 100%);
  border-radius: 32px;
  padding: 26px 32px 30px;
  box-sizing: border-box;

  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.96),
    rgba(235, 245, 255, 0.94)
  );
  box-shadow:
    0 18px 40px rgba(148, 163, 184, 0.45),
    0 0 32px rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

/* 标题区域 */
.create-header {
  margin-bottom: 20px;
}

.create-title {
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.create-subtitle {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

/* 主体：左表单 + 右预览 */
.create-main {
  display: grid;
  grid-template-columns: minmax(0, 52%) minmax(0, 48%);
  gap: 26px;
}

/* 左侧表单 */
.create-left {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  color: #4b5563;
}

.field-input {
  padding: 9px 10px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  background: rgba(248, 250, 252, 0.96);
}

.field-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.25);
}

.field-textarea {
  resize: vertical;
  min-height: 90px;
}

/* 文件选择框简单美化一下 */
.field-file {
  font-size: 13px;
}

.field-hint {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

/* 发布按钮：蓝色胶囊按钮 */
.submit-btn {
  margin-top: 6px;
  align-self: flex-start;
  padding: 8px 26px;
  border-radius: 999px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.5);
}

.submit-btn:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}

.msg {
  margin-top: 6px;
  font-size: 13px;
  color: #374151;
}

/* 右侧预览卡片 */
.create-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.preview-card {
  padding: 10px;
  border-radius: 22px;
  background: linear-gradient(
    135deg,
    rgba(219, 234, 254, 0.95),
    rgba(239, 246, 255, 0.95)
  );
  box-shadow:
    0 10px 26px rgba(148, 163, 184, 0.4),
    0 0 18px rgba(255, 255, 255, 0.75);
}

.preview-img-wrapper {
  position: relative;
  width: 100%;
  padding-top: 66%;
  border-radius: 16px;
  overflow: hidden;
  background: #e5edf8;
}

.preview-img-wrapper img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.96);
  font-size: 13px;
  color: #9ca3af;
}

/* 响应式：屏幕窄时上下排列 */
@media (max-width: 900px) {
  .create-shell {
    padding: 20px 18px 24px;
    border-radius: 24px;
  }

  .create-main {
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
  }
}
</style>

