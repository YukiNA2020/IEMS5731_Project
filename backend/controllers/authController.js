// backend/controllers/authController.js  （ESM）

import db from '../db.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// 测试用：/api/auth/test
export function authTest(req, res) {
  res.json({ message: 'Auth route works! ✅' });
}

// 注册
export async function register(req, res) {
  const { email, password, nickname } = req.body;

  // 1. 简单校验
  if (!email || !password || !nickname) {
    return res.status(400).json({ message: '邮箱、密码、昵称都是必填的' });
  }

  try {
    // 2. 检查邮箱是否已存在
    const [existRows] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existRows.length > 0) {
      return res.status(409).json({ message: '该邮箱已被注册' });
    }

    // 3. 哈希密码
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. 写入数据库
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)',
      [email, passwordHash, nickname]
    );

    const newUserId = result.insertId;

    // 5. 再查一遍把完整数据拿出来（含 created_at）
    const [rows] = await db.query(
      'SELECT id, email, nickname, created_at FROM users WHERE id = ?',
      [newUserId]
    );

    const user = rows[0];

    return res.status(201).json({
      message: '注册成功',
      user,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: '注册失败（服务器错误）' });
  }
}

// 登录
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '邮箱和密码都是必填的' });
  }

  try {
    // 1. 查找用户
    const [rows] = await db.query(
      'SELECT id, email, password_hash, nickname, created_at FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    const user = rows[0];

    // 2. 校验密码
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // 3. 登录成功 —— 现在阶段不搞 JWT，直接把用户信息返回给前端
    //    （后续你要做 2.0 / 3.0 再加 token 也不迟）
    return res.json({
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: '登录失败（服务器错误）' });
  }
}

// 退出登录（目前只是占位，返回一个成功消息）
export async function logout(req, res) {
  return res.json({ message: '退出成功（占位版）' });
}

//更新个人信息
// 更新用户资料：PUT /api/auth/users/:id
export async function updateUserProfile(req, res) {
  const { id } = req.params;
  const { nickname, signature } = req.body;

  if (!nickname || !nickname.trim()) {
    return res.status(400).json({ message: '昵称不能为空' });
  }

  try {
    // 更新 users 表
    await db.query(
      'UPDATE users SET nickname = ?, signature = ? WHERE id = ?',
      [nickname.trim(), signature || null, id]
    );

    // 再查一遍最新的用户信息，返回给前端
    const [rows] = await db.query(
      'SELECT id, email, nickname, signature, created_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = rows[0];

    return res.json({
      message: '更新成功',
      user,
    });
  } catch (err) {
    console.error('updateUserProfile error:', err);
    return res.status(500).json({ message: '更新用户资料失败（服务器错误）' });
  }
}

// 获取用户信息：根据 ID
export async function getUserById(req, res) {
  const { id } = req.params;

  try {
    // 查找用户
    const [rows] = await db.query(
      'SELECT id, email, nickname, signature, created_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = rows[0];
    return res.json({ user });
  } catch (err) {
    console.error('getUserById error:', err);
    return res.status(500).json({ message: '服务器错误' });
  }
}