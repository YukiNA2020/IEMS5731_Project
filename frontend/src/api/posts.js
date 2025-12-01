// frontend/src/api/posts.js
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// 通用获取作品列表
// 支持参数：- search: 按标题 / 简介模糊搜索  -authorId: 按作者过滤
export async function fetchPosts(params = {}) {
  const res = await axios.get(`${API_BASE}/posts`, { params });
  return res.data;
}


// 获取所有作品（首页列表）+ 支持搜索等参数
export async function fetchAllPosts(params = {}) {
  const res = await axios.get(`${API_BASE}/posts`, { params });
  return res.data; // 数组
}

// ✅ 通用获取作品列表：支持 search / authorId
// ✅ 已有：获取某个作者的作品列表
export async function fetchPostsByAuthor(authorId) {
  const res = await axios.get(`${API_BASE}/posts`, {
    params: { authorId },
  });
  return res.data;
}

// 获取单个作品详情
export async function fetchPostById(id) {
  const res = await axios.get(`${API_BASE}/posts/${id}`);
  return res.data; // 单个对象
}

// ✅ 新增：删除作品（仅作者可删）
export async function deletePostById(id, userId) {
  const res = await axios.delete(`${API_BASE}/posts/${id}`, {
    // axios.delete 要通过 data 传 body
    params: { userId },
  });
  return res.data;
}



export async function createPost({ title, description, imageFile }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    throw new Error('请先登录再发布作品');
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description || '');
  formData.append('authorId', user.id);   // 使用当前登录用户作为作者

  if (imageFile) {
    // 注意字段名要叫 image，对应后端 upload.single('image')
    formData.append('image', imageFile);
  }

  const res = await axios.post(`${API_BASE}/posts`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res.data; // 返回新建好的作品对象
}