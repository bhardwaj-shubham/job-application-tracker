import ERROR_CODES from "../constants/errorCodes.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import * as documentService from "../services/document.service.js";

const uploadDocument = asyncHandler(async (req, res) => {
  const { id: applicationId } = req.validated.params;
  const { type } = req.validated.body;

  const result = await documentService.uploadDocument({
    applicationId,
    userId: req.user.id,
    file: req.file,
    type,
  });

  if (result.applicationNotFound) {
    throw new ApiError(
      404,
      "Application not found",
      [],
      ERROR_CODES.APPLICATION_NOT_FOUND,
    );
  }

  if (result.invalidFileType) {
    throw new ApiError(
      400,
      "File content does not match an allowed document type",
      [],
      ERROR_CODES.INVALID_FILE_TYPE,
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, result.document, "Document uploaded successfully"),
    );
});

const listDocuments = asyncHandler(async (req, res) => {
  const { id: applicationId } = req.validated.params;

  const documents = await documentService.listDocuments({
    applicationId,
    userId: req.user.id,
  });

  if (documents === null) {
    throw new ApiError(
      404,
      "Application not found",
      [],
      ERROR_CODES.APPLICATION_NOT_FOUND,
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, documents, "Documents fetched successfully"));
});

const deleteDocument = asyncHandler(async (req, res) => {
  const { id: applicationId, documentId } = req.validated.params;

  const result = await documentService.deleteDocument({
    applicationId,
    userId: req.user.id,
    documentId,
  });

  if (result.applicationNotFound) {
    throw new ApiError(
      404,
      "Application not found",
      [],
      ERROR_CODES.APPLICATION_NOT_FOUND,
    );
  }

  if (result.documentNotFound) {
    throw new ApiError(
      404,
      "Document not found",
      [],
      ERROR_CODES.DOCUMENT_NOT_FOUND,
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Document deleted successfully"));
});

export { uploadDocument, listDocuments, deleteDocument };
