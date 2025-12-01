// frontend/src/api/comments.js
import axios from 'axios';

// 后端统一前缀
const API_BASE = 'http://localhost:3000/api';

// 获取某个作品的所有评论
export async function fetchCommentsByPostId(postId) {
  const res = await axios.get(`${API_BASE}/comments/post/${postId}`);
  return res.data; // 数组
}

// 发表一条评论（现在先用固定 userId = 1）
export async function createComment({ workId, userId, content }) {
  const res = await axios.post(`${API_BASE}/comments`, {
    workId,
    userId,
    content,
  });
  return res.data; // 新增的那条评论
}

// （可选）删除评论：后面做权限时再用
export async function deleteComment(commentId, userId) {
  const res = await axios.delete(`${API_BASE}/comments/${commentId}`, {
    data: { userId },
  });
  return res.data;
}
