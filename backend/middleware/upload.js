// backend/middleware/upload.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// 处理 ES Module 下的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 存储配置：保存到 backend/uploads 目录
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  }
});

// 只允许图片文件
function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('只允许上传图片文件'), false);
  }
  cb(null, true);
}

// 这里把大小从 5MB 改成 10MB（你之前问过）
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter
});

export default upload;
