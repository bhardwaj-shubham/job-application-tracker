import fs from "fs/promises";

import { DocType } from "../../generated/prisma/enums.ts";
import cloudinary from "../integrations/cloudinary/cloudinary.js";
import prisma from "../config/db.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const REPLACEABLE_DOCUMENT_TYPES = ["RESUME", "COVER_LETTER", "PORTFOLIO"];

const uploadDocument = asyncHandler(async (req, res) => {
  const { id: applicationId } = req.params;
  const { type } = req.body || {};

  if (!req.file) {
    throw new ApiError(400, "Please upload a file");
  }

  if (!type || !Object.values(DocType).includes(type)) {
    await fs.unlink(req.file.path).catch((err) => {
      console.error("Error deleting file:", err);
    });
    throw new ApiError(400, "Invalid document type");
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: req.user.id },
  });

  if (!application) {
    await fs.unlink(req.file.path).catch(() => {});
    throw new ApiError(404, "Application not found");
  }

  let uploadedFile;

  try {
    uploadedFile = await cloudinary.uploader.upload(req.file.path, {
      folder: `job-tracker/${req.user.id}/${applicationId}`,
      resource_type: "auto",
    });
  } catch (error) {
    throw new ApiError(500, "Failed to upload file to cloudinary");
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }

  let existingDocument = null;
  let document = null;
  if (REPLACEABLE_DOCUMENT_TYPES.includes(type)) {
    existingDocument = await prisma.document.findFirst({
      where: { applicationId, type },
    });

    document = await prisma.document.create({
      data: {
        applicationId,
        type,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        resourceType: uploadedFile.resource_type,
        url: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
      },
    });

    if (existingDocument) {
      await prisma.document.delete({
        where: { id: existingDocument.id },
      });

      await cloudinary.uploader
        .destroy(existingDocument.publicId, {
          resource_type: existingDocument.resourceType,
        })
        .catch((err) => {
          console.error("Error deleting file from cloudinary:", err);
        });
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(201, document, "Document uploaded successfully"));
});

const listDocuments = asyncHandler(async (req, res) => {
  const { id: applicationId } = req.params;

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId: req.user.id,
    },
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const documents = await prisma.document.findMany({
    where: { applicationId },
    orderBy: { uploadedAt: "desc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, documents, "Documents fetched successfully"));
});

const deleteDocument = asyncHandler(async (req, res) => {
  const { id: applicationId, documentId } = req.params;

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId: req.user.id,
    },
    select: { id: true },
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const document = await prisma.document.findFirst({
    where: { id: documentId, applicationId },
  });

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  await prisma.document.delete({
    where: { id: documentId },
  });

  await cloudinary.uploader
    .destroy(document.publicId, {
      resource_type: document.resourceType,
    })
    .catch((err) => {
      console.error("Error deleting file from cloudinary:", err);
    });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Document deleted successfully"));
});

export { uploadDocument, listDocuments, deleteDocument };
