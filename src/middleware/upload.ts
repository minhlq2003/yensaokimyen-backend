import { Request } from "express";
import multer, { StorageEngine } from "multer";
import { RequestHandler } from "express";

// Tạo storage không có tham số
const storage: StorageEngine = multer.memoryStorage();

const upload: RequestHandler = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
}).single("file");

export default upload;
