import { describe, it, expect, vi, beforeEach } from "vitest";
import * as documentRepository from "../../src/repositories/document.repository.js";
import * as applicationRepository from "../../src/repositories/application.repository.js";
import * as cloudinaryService from "../../src/integrations/cloudinary/cloudinary.service.js";
import validateFileSignature from "../../src/utils/file.validator.js";
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
} from "../../src/services/document.service.js";

vi.mock("../../src/repositories/document.repository.js", () => ({
  create: vi.fn(),
  findMany: vi.fn(),
  findById: vi.fn(),
  findByApplicationByType: vi.fn(),
  deleteById: vi.fn(),
}));

vi.mock("../../src/repositories/application.repository.js", () => ({
  findById: vi.fn(),
}));

vi.mock("../../src/integrations/cloudinary/cloudinary.service.js", () => ({
  uploadBuffer: vi.fn(),
  deleteAsset: vi.fn(),
}));

vi.mock("../../src/utils/file.validator.js", () => ({
  default: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const fakeFile = {
  buffer: Buffer.from("fake file content"),
  originalname: "resume.pdf",
};

describe("document.service - uploadDocument", () => {
  it("returns applicationNotFound when application does not exist", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    const result = await uploadDocument({
      applicationId: "app-1",
      userId: "user-1",
      file: fakeFile,
      type: "RESUME",
    });

    expect(result).toEqual({ applicationNotFound: true });
    expect(validateFileSignature).not.toHaveBeenCalled();
    expect(cloudinaryService.uploadBuffer).not.toHaveBeenCalled();
  });

  it("returns invalidFileType when magic-byte validation fails", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    validateFileSignature.mockResolvedValue(null);

    const result = await uploadDocument({
      applicationId: "app-1",
      userId: "user-1",
      file: fakeFile,
      type: "RESUME",
    });

    expect(result).toEqual({ invalidFileType: true });
    expect(cloudinaryService.uploadBuffer).not.toHaveBeenCalled();
  });

  it("uploads and creates a document when everything is valid", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    validateFileSignature.mockResolvedValue({
      mime: "application/pdf",
      ext: "pdf",
    });
    cloudinaryService.uploadBuffer.mockResolvedValue({
      secure_url: "https://cloudinary.com/file.pdf",
      public_id: "job-tracker/app-1/abc123.pdf",
      resource_type: "image",
    });
    documentRepository.findByApplicationByType.mockResolvedValue(null);
    const createdDocument = { id: "doc-1", type: "RESUME" };
    documentRepository.create.mockResolvedValue(createdDocument);

    const result = await uploadDocument({
      applicationId: "app-1",
      userId: "user-1",
      file: fakeFile,
      type: "RESUME",
    });

    expect(documentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: "app-1",
        type: "RESUME",
        mimetype: "application/pdf", // from detectedType, NOT file.mimetype
        filename: "resume.pdf",
      }),
    );
    expect(result).toEqual({ document: createdDocument });
  });

  it("deletes the existing document when replacing a REPLACEABLE type", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    validateFileSignature.mockResolvedValue({ mime: "application/pdf" });
    cloudinaryService.uploadBuffer.mockResolvedValue({
      secure_url: "url",
      public_id: "new-id",
      resource_type: "image",
    });
    const existingDocument = {
      id: "old-doc",
      publicId: "old-id",
      resourceType: "image",
    };
    documentRepository.findByApplicationByType.mockResolvedValue(
      existingDocument,
    );
    documentRepository.create.mockResolvedValue({ id: "new-doc" });
    cloudinaryService.deleteAsset.mockResolvedValue({ result: "ok" });

    await uploadDocument({
      applicationId: "app-1",
      userId: "user-1",
      file: fakeFile,
      type: "RESUME",
    });

    expect(documentRepository.deleteById).toHaveBeenCalledWith("old-doc");
    expect(cloudinaryService.deleteAsset).toHaveBeenCalledWith(
      "old-id",
      "image",
    );
  });

  it("does NOT check for existing document when type is OTHER", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    validateFileSignature.mockResolvedValue({ mime: "application/pdf" });
    cloudinaryService.uploadBuffer.mockResolvedValue({
      secure_url: "url",
      public_id: "id",
      resource_type: "image",
    });
    documentRepository.create.mockResolvedValue({ id: "doc-1" });

    await uploadDocument({
      applicationId: "app-1",
      userId: "user-1",
      file: fakeFile,
      type: "OTHER",
    });

    expect(documentRepository.findByApplicationByType).not.toHaveBeenCalled();
    expect(documentRepository.deleteById).not.toHaveBeenCalled();
  });

  it("does not create document when Cloudinary upload fails", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });

    validateFileSignature.mockResolvedValue({
      mime: "application/pdf",
      ext: "pdf",
    });

    cloudinaryService.uploadBuffer.mockRejectedValue(
      new Error("Cloudinary upload failed"),
    );

    await expect(
      uploadDocument({
        applicationId: "app-1",
        userId: "user-1",
        file: fakeFile,
        type: "RESUME",
      }),
    ).rejects.toThrow("Cloudinary upload failed");

    expect(documentRepository.create).not.toHaveBeenCalled();
  });

  it("throws when document creation fails", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });

    validateFileSignature.mockResolvedValue({
      mime: "application/pdf",
      ext: "pdf",
    });

    cloudinaryService.uploadBuffer.mockResolvedValue({
      secure_url: "url",
      public_id: "new-id",
      resource_type: "raw",
    });

    documentRepository.create.mockRejectedValue(new Error("Database error"));

    await expect(
      uploadDocument({
        applicationId: "app-1",
        userId: "user-1",
        file: fakeFile,
        type: "RESUME",
      }),
    ).rejects.toThrow("Database error");
  });
});

describe("document.service - listDocuments", () => {
  it("returns null when application does not exist", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    const result = await listDocuments({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(documentRepository.findMany).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("returns documents when application exists", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    const documents = [{ id: "doc-1" }, { id: "doc-2" }];
    documentRepository.findMany.mockResolvedValue(documents);

    const result = await listDocuments({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toEqual(documents);
  });
});

describe("document.service - deleteDocument", () => {
  it("returns applicationNotFound when application does not exist", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    const result = await deleteDocument({
      applicationId: "app-1",
      userId: "user-1",
      documentId: "doc-1",
    });

    expect(documentRepository.findById).not.toHaveBeenCalled();
    expect(result).toEqual({ applicationNotFound: true });
  });

  it("returns documentNotFound when document does not exist for this application", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    documentRepository.findById.mockResolvedValue(null);

    const result = await deleteDocument({
      applicationId: "app-1",
      userId: "user-1",
      documentId: "doc-1",
    });

    expect(cloudinaryService.deleteAsset).not.toHaveBeenCalled();
    expect(result).toEqual({ documentNotFound: true });
  });

  it("deletes from DB first, then attempts Cloudinary cleanup", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    const document = { id: "doc-1", publicId: "pub-1", resourceType: "raw" };
    documentRepository.findById.mockResolvedValue(document);
    cloudinaryService.deleteAsset.mockResolvedValue({ result: "ok" });

    const result = await deleteDocument({
      applicationId: "app-1",
      userId: "user-1",
      documentId: "doc-1",
    });

    expect(documentRepository.deleteById).toHaveBeenCalledWith("doc-1");
    expect(cloudinaryService.deleteAsset).toHaveBeenCalledWith("pub-1", "raw");
    expect(result).toEqual({ success: true });
  });

  it("still succeeds when Cloudinary deletion fails", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });

    const document = {
      id: "doc-1",
      publicId: "pub-1",
      resourceType: "raw",
    };

    documentRepository.findById.mockResolvedValue(document);

    cloudinaryService.deleteAsset.mockRejectedValue(
      new Error("Cloudinary deletion failed"),
    );

    const result = await deleteDocument({
      applicationId: "app-1",
      userId: "user-1",
      documentId: "doc-1",
    });

    expect(documentRepository.deleteById).toHaveBeenCalledWith("doc-1");
    expect(result).toEqual({ success: true });
  });
});
