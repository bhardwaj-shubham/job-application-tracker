import multer from "multer";

import ERROR_CODES from "../constants/errorCodes.js";
import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const handleMulterUpload = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return next(
        new ApiError(400, err.message, [], ERROR_CODES.VALIDATION_ERROR),
      );
    }

    if (err) {
      return next(
        new ApiError(
          400,
          err.message || "File upload failed",
          [],
          ERROR_CODES.VALIDATION_ERROR,
        ),
      );
    }

    if (!req.file) {
      return next(
        new ApiError(
          400,
          "Please upload a file",
          [],
          ERROR_CODES.VALIDATION_ERROR,
        ),
      );
    }

    next();
  });
};

export { upload, handleMulterUpload };
