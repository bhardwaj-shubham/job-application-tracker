import path from "path";

import * as documentRepository from "../repositories/document.repository.js";
import * as applicationRepository from "../repositories/application.repository.js";
import * as cloudinaryService from "../integrations/cloudinary/cloudinary.service.js";
import validateFileSignature from "../utils/file.validator.js";

const REPLACEABLE_DOCUMENT_TYPES = ["RESUME", "COVER_LETTER", "PORTFOLIO"];

const verifyApplicationOwnership = async (applicationId, userId) => {
  return applicationRepository.findById(applicationId, userId);
};

const uploadDocument = async ({ applicationId, userId, file, type }) => {
  const application = await verifyApplicationOwnership(applicationId, userId);

  if (!application) {
    return { applicationNotFound: true };
  }

  const detectedType = await validateFileSignature(file.buffer);

  if (!detectedType) {
    return { invalidFileType: true };
  }

  const fileExtension = path.extname(file.originalname).slice(1);

  const uploadedFile = await cloudinaryService.uploadBuffer(file.buffer, {
    folder: `job-tracker/${userId}/${applicationId}`,
    resource_type: "auto",
    format: fileExtension,
  });

  console.log("Full upload response:", JSON.stringify(uploadedFile, null, 2));

  let exisitingDocument = null;
  if (REPLACEABLE_DOCUMENT_TYPES.includes(type)) {
    exisitingDocument = await documentRepository.findByApplicationByType(
      applicationId,
      type,
    );
  }

  const document = await documentRepository.create({
    applicationId,
    type,
    filename: file.originalname,
    mimetype: detectedType.mime,
    resourceType: uploadedFile.resource_type,
    url: uploadedFile.secure_url,
    publicId: uploadedFile.public_id,
  });

  if (exisitingDocument) {
    await documentRepository.deleteById(exisitingDocument.id);

    await cloudinaryService
      .deleteAsset(exisitingDocument.publicId, exisitingDocument.resourceType)
      .catch((err) => {
        console.error("Error deleting old file from cloudinary: ", err);
      });
  }

  return { document };
};

const listDocuments = async ({ applicationId, userId }) => {
  const application = await verifyApplicationOwnership(applicationId, userId);

  if (!application) {
    return null;
  }

  return documentRepository.findMany(applicationId);
};

const deleteDocument = async ({ applicationId, userId, documentId }) => {
  const application = await verifyApplicationOwnership(applicationId, userId);

  if (!application) {
    return { applicationNotFound: true };
  }

  const document = await documentRepository.findById(documentId, applicationId);

  if (!document) {
    return { documentNotFound: true };
  }

  await documentRepository.deleteById(documentId);

  // FIXME: remove console.logs after testing
  const result = await cloudinaryService
    .deleteAsset(document.publicId, document.resourceType)
    .catch((err) => console.error("Error deleting file from cloudinary:", err));

  console.log("Cloudinary delete result", result);

  if (!result || result.result !== "ok") {
    console.error("Cloudinary did not confirm deletion:", deleteResult);
  }

  return { success: true };
};

export { uploadDocument, listDocuments, deleteDocument };
