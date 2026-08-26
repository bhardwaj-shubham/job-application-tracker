import { getDocumentProxy, extractText } from "unpdf";
import { sanitizePii } from "../utils/sanitize-pii.js";

const extractPdfText = async (buffer) => {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));

  const { text, totalPages } = await extractText(pdf, {
    mergePages: true,
  });

  const cleanedText = text.trim();
  const sanitizedText = sanitizePii(cleanedText);

  if (!sanitizedText) {
    throw new Error("Could not extract text from pdf");
  }

  return {
    text: sanitizedText,
    totalPages,
  };
};

export { extractPdfText };
