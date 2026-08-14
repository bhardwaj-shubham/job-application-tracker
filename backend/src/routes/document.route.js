import express from "express";

import {
  upload,
  handleMulterMiddleware,
} from "../middleware/multer.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  uploadDocument,
  listDocuments,
  deleteDocument,
} from "../controllers/document.controller.js";
import {
  uploadDocumentSchema,
  documentIdSchema,
} from "../validators/document.validator.js";

const documentRouter = express.Router();

documentRouter.post(
  "/",
  handleMulterMiddleware(upload.single("file")),
  validate(uploadDocumentSchema),
  uploadDocument,
);
documentRouter.get("/", listDocuments);
documentRouter.delete(
  "/:documentId",
  validate(documentIdSchema, "params"),
  deleteDocument,
);

export default documentRouter;
