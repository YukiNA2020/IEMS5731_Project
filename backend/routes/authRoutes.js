// backend/routes/authRoutes.js

import { Router } from 'express';

import { authTest,register, login, logout, updateUserProfile,getUserById, } from '../controllers/authController.js';

const router = Router();

// 测试用：GET /api/auth/test
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route works! ✅' });
});

// 测试
//router.get('/test', authTest);

// 注册
router.post('/register', register);

// 登录
router.post('/login', login);

// 登出
router.post('/logout', logout);

// ✅ 新增：更新用户资料
router.put('/users/:id', updateUserProfile);

// 获取用户信息
router.get('/users/:id', getUserById);  // 新增

export default router;
