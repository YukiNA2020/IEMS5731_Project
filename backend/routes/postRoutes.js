// backend/routes/postRoutes.js

import { Router } from 'express';
import upload from '../middleware/upload.js';
import {
  createPost,
  getPosts,
  getPostById,
  deletePost
} from '../controllers/postController.js';
import { getAllPosts } from '../controllers/postController.js';


const router = Router();
// 获取所有作品
//router.get('/', getAllPosts);

// 列表 + 搜索
router.get('/', getPosts);

// 详情
router.get('/:id', getPostById);

// 创建作品（上传图片）
router.post('/', upload.single('image'), createPost);

// 删除作品（1.0 简化版权限）
router.delete('/:id', deletePost);

export default router;
