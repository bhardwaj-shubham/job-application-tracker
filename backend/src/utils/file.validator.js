import { fileTypeFromBuffer } from "file-type";

const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const validateFileSignature = async (buffer) => {
  const detectedType = await fileTypeFromBuffer(buffer);

  if (!detectedType || !ALLOWED_FILE_TYPES.has(detectedType.mime)) {
    return null;
  }

  return detectedType;
};

export default validateFileSignature;
