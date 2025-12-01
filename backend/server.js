// backend/server.js  （ESM 版本）

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';




import db from './db.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

// 处理 __dirname（ESM 没有内置 __dirname）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 静态文件托管：让浏览器可以通过 /uploads/xxx 访问图片
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 后端正常运行测试
app.get('/', (req, res) => {
  res.send('Backend is running ✅');
});

// 数据库连接测试
app.get('/db-test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT NOW() AS now;');
    res.json({
      message: 'DB connected successfully 🎉',
      currentTime: rows[0].now,
    });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// 认证相关路由：/api/auth/...
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);



// 以后我们会在这里挂载 /api/posts 路由

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// 可选导出，方便以后做测试用
export default app;
