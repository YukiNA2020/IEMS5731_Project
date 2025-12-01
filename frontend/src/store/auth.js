// frontend/src/store/auth.js
import { reactive } from 'vue';

const state = reactive({
  // 从 localStorage 里恢复用户（刷新后还能保持登录）
  user: JSON.parse(localStorage.getItem('user') || 'null'),
});

function setUser(user) {
  state.user = user;
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

export default {
  state,
  setUser,
};
