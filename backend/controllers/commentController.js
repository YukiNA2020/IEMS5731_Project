// backend/controllers/commentController.js

import db from '../db.js';

// 创建评论：POST /api/comments
// Body: { workId, userId, content }
export async function createComment(req, res) {
  const { workId, userId, content } = req.body;

  if (!workId || !userId || !content) {
    return res
      .status(400)
      .json({ message: '缺少必要字段（workId / userId / content）' });
  }

  try {
    // 可选：检查作品是否存在
    const [posts] = await db.query('SELECT id FROM posts WHERE id = ?', [
      workId,
    ]);
    if (posts.length === 0) {
      return res.status(400).json({ message: '目标作品不存在' });
    }

    // 插入评论
    const [result] = await db.query(
      'INSERT INTO comments (work_id, user_id, content) VALUES (?, ?, ?)',
      [workId, userId, content]
    );

    // 查出刚插入的评论（带作者昵称）
    const [rows] = await db.query(
      `SELECT c.id,
              c.work_id,
              c.user_id,
              c.content,
              c.created_at,
              u.nickname AS author_nickname
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create comment error:', err);
    return res.status(500).json({ message: '创建评论失败（服务器错误）' });
  }
}

// 获取某个作品的所有评论：GET /api/comments/post/:workId
export async function getCommentsByPost(req, res) {
  const { workId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT c.id,
              c.work_id,
              c.user_id,
              c.content,
              c.created_at,
              u.nickname AS author_nickname
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.work_id = ?
       ORDER BY c.created_at ASC`,
      [workId]
    );

    return res.json(rows); // 可能是空数组 []
  } catch (err) {
    console.error('Get comments error:', err);
    return res.status(500).json({ message: '获取评论失败（服务器错误）' });
  }
}

// 删除评论：DELETE /api/comments/:id
// 简化权限：Body 里带 userId，只允许自己的评论自己删
export async function deleteComment(req, res) {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ message: '缺少 userId（用于验证是否为评论作者）' });
  }

  try {
    // 查评论
    const [rows] = await db.query(
      'SELECT user_id FROM comments WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '评论不存在' });
    }

    const comment = rows[0];

    if (comment.user_id !== Number(userId)) {
      return res
        .status(403)
        .json({ message: '无权限删除此评论（仅作者可删）' });
    }

    await db.query('DELETE FROM comments WHERE id = ?', [id]);

    return res.json({ message: '删除评论成功' });
  } catch (err) {
    console.error('Delete comment error:', err);
    return res
      .status(500)
      .json({ message: '删除评论失败（服务器错误）' });
  }
}
