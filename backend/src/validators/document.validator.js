import { z } from "zod";
import { DocType } from "../../generated/prisma/enums.ts";

const uploadDocumentSchema = z.object({
  type: z.enum(DocType),
});

const documentIdSchema = z.object({
  documentId: z.string().trim().min(1, "Document ID is required"),
});

export { uploadDocumentSchema, documentIdSchema };
