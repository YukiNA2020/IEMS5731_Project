// backend/controllers/postController.js

import db from '../db.js';

// 创建作品：POST /api/posts
// 需要 multipart/form-data, 字段: title, description, authorId, 文件字段: image


// 创建作品（支持带或不带图片）
export async function createPost(req, res) {
  try {
    const { title, description, authorId } = req.body;

    if (!title || !authorId) {
      return res.status(400).json({ message: '标题和作者ID必填' });
    }

    // 如果上传了文件，就用上传文件生成的 URL
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
      // 兜底：也支持前端直接传一个 image_url
      imageUrl = req.body.image_url;
    }

    // 写入数据库
    const [result] = await db.query(
      'INSERT INTO posts (title, description, image_url, author_id) VALUES (?, ?, ?, ?)',
      [title, description || '', imageUrl, authorId]
    );

    // 再查一遍，把作者昵称一起返回给前端
    const [rows] = await db.query(
      `SELECT p.*, u.nickname AS author_nickname
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createPost error:', err);
    return res.status(500).json({ message: '创建作品失败（服务器错误）' });
  }
}



// 获取作品列表：GET /api/posts?search=xxx&authorId=1
export async function getPosts(req, res) {
  const { search, authorId, author_id } = req.query;
  const authorFilter = authorId || author_id;

  

  let sql = `
    SELECT p.id, p.title, p.description, p.image_url, p.author_id, p.created_at,
           u.nickname AS author_nickname,
           (SELECT COUNT(*) FROM comments c WHERE c.work_id = p.id) AS comment_count
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += ' AND (p.title LIKE ? OR p.description LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s);
  }

  if (authorFilter) {
    sql += ' AND p.author_id = ?';
    params.push(authorFilter);
  }

  sql += ' ORDER BY p.created_at DESC';

  try {
    const [rows] = await db.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error('Get posts error:', err);
    return res.status(500).json({ message: '获取作品列表失败（服务器错误）' });
  }
}

// 获取单个作品：GET /api/posts/:id
export async function getPostById(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT p.id, p.title, p.description, p.image_url, p.author_id, p.created_at,
              u.nickname AS author_nickname,
              (SELECT COUNT(*) FROM comments c WHERE c.work_id = p.id) AS comment_count
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '作品不存在' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('Get post by id error:', err);
    return res.status(500).json({ message: '获取作品详情失败（服务器错误）' });
  }
}

// 删除作品：DELETE /api/posts/:id   （1.0 简化版）
// 前端需要在 body 里传 userId，用来做一个简单的“作者自己才能删”的检查
export async function deletePost(req, res) {
  const { id } = req.params;
  const userId = req.query.userId || req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: '缺少 userId（用于验证操作人是否是作者）' });
  }

  try {
    // 先查作品
    const [rows] = await db.query(
      'SELECT author_id FROM posts WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '作品不存在' });
    }

    const post = rows[0];

    if (post.author_id !== Number(userId)) {
      return res.status(403).json({ message: '无权限删除此作品（仅作者可删）' });
    }

    await db.query('DELETE FROM posts WHERE id = ?', [id]);

    return res.json({ message: '删除成功' });
  } catch (err) {
    console.error('Delete post error:', err);
    return res.status(500).json({ message: '删除作品失败（服务器错误）' });
  }
}

// 获取所有作品列表
// controllers/postController.js
export async function getAllPosts(req, res) {
  try {
    // 注意这里加了中括号！
    const [rows] = await db.query(
      `SELECT p.*, u.nickname AS author_nickname
       FROM posts p
       JOIN users u ON p.author_id = u.id
       ORDER BY p.created_at DESC`
    );

    return res.json(rows);   // 现在只返回 “纯作品数组”
  } catch (err) {
    console.error('Get posts error:', err);
    return res.status(500).json({ message: '服务器错误' });
  }
}
