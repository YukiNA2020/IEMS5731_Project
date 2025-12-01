// backend/routes/commentRoutes.js

import { Router } from 'express';
import {
  createComment,
  getCommentsByPost,
  deleteComment
} from '../controllers/commentController.js';

const router = Router();

// 获取某作品的所有评论
// GET /api/comments/post/:workId
router.get('/post/:workId', getCommentsByPost);

// 创建评论
// POST /api/comments
router.post('/', createComment);

// 删除评论
// DELETE /api/comments/:id
router.delete('/:id', deleteComment);

export default router;
