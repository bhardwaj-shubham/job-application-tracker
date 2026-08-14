import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

import ApiError from "../utils/ApiError.js";

const tempDir = path.join(process.cwd(), "public", "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "application/pdf", // .pdf
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "image/jpeg", // .jpg
    "image/png", // .png
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, Word, and image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

const handleMulterMiddleware = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return next(new ApiError(400, err.message));
    }

    if (err) {
      return next(new ApiError(400, err.message || "File upload failed"));
    }

    if (!req.file) {
      return next(new ApiError(400, "Please upload a file"));
    }

    next();
  });
};

export { upload, handleMulterMiddleware };
