import multer from "multer";
import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const handleMulterUpload = (uploadMiddleware) => (req, res, next) => {
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

export { upload, handleMulterUpload };
