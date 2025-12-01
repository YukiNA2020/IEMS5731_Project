// frontend/src/api/auth.js
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/auth';

// 登录：传入 email 和 password，返回后端的 user 对象
export async function login(email, password) {
  const res = await axios.post(`${API_BASE}/login`, {
    email,
    password,
  });
  // 后端返回 { message: '登录成功', user: {...} }
  return res.data.user;
}

// 以后可以在这里再加 register 等接口
// export async function register(...) { ... }


// ✅ 新增：更新用户资料（昵称 / 个性签名等）
// id: 用户 id
// data: 对象，如 { nickname: '新昵称', signature: '新的个性签名' }
export async function updateUserProfile(id, data) {
  const res = await axios.put(`${API_BASE}/users/${id}`, data);
  // 后端返回 { message, user }
  return res.data; // 建议在调用处用 res.user 来更新前端状态
}

// 获取指定 ID 的用户信息
export async function fetchUserById(id) {
  const res = await axios.get(`${API_BASE}/users/${id}`);
  return res.data.user || res.data;
}
