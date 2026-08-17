import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import path from "path";
import { fileURLToPath } from "url";
import app from "../../src/app.js";
import { createTestUser, cleanupTestUser } from "../helpers/testAuth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fixturesDir = path.join(__dirname, "../fixtures");

const minimalPdfBuffer = Buffer.from(
  "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF",
);

describe("Document endpoints", () => {
  let userA, userB;
  let applicationA, applicationB;

  beforeAll(async () => {
    userA = await createTestUser("-a");
    userB = await createTestUser("-b");

    const appARes = await request(app)
      .post("/api/v1/applications")
      .set("Cookie", userA.cookie)
      .send({ company: "Docs Co", role: "Engineer" });
    applicationA = appARes.body.data.id;

    const appBRes = await request(app)
      .post("/api/v1/applications")
      .set("Cookie", userB.cookie)
      .send({ company: "Other Co", role: "Engineer" });
    applicationB = appBRes.body.data.id;
  });

  afterAll(async () => {
    await cleanupTestUser(userA.userId);
    await cleanupTestUser(userB.userId);
  });

  describe("POST /api/v1/applications/:id/documents", () => {
    it("uploads a valid PDF for the owner", async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie)
        .attach("file", path.join(fixturesDir, "valid.pdf"))
        .field("type", "RESUME");

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe("RESUME");
      expect(res.body.data.mimetype).toBe("application/pdf");
    });

    it("returns 400 for a file that fails magic-byte validation", async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie)
        .attach("file", path.join(fixturesDir, "invalid.txt"))
        .field("type", "RESUME");

      expect(res.status).toBe(400);
    });

    it("returns 400 for missing file", async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie)
        .field("type", "RESUME");

      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid document type", async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie)
        .attach("file", minimalPdfBuffer, {
          filename: "resume.pdf",
          contentType: "application/pdf",
        })
        .field("type", "BANANA");

      expect(res.status).toBe(400);
    });

    it("replaces the existing document of the same type", async () => {
      const firstRes = await request(app)
        .post(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie)
        .attach("file", path.join(fixturesDir, "valid.pdf"))
        .field("type", "COVER_LETTER");

      const secondRes = await request(app)
        .post(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie)
        .attach("file", path.join(fixturesDir, "valid2.pdf"))
        .field("type", "COVER_LETTER");

      expect(secondRes.status).toBe(201);

      const listRes = await request(app)
        .get(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie);

      const coverLetters = listRes.body.data.filter(
        (doc) => doc.type === "COVER_LETTER",
      );
      expect(coverLetters.length).toBe(1);
      expect(coverLetters[0].id).toBe(secondRes.body.data.id);
    });

    it("returns 404 when application belongs to a different user", async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationB}/documents`)
        .set("Cookie", userA.cookie)
        .attach("file", minimalPdfBuffer, {
          filename: "resume.pdf",
          contentType: "application/pdf",
        })
        .field("type", "RESUME");

      expect(res.status).toBe(404);
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationA}/documents`)
        .attach("file", minimalPdfBuffer, {
          filename: "resume.pdf",
          contentType: "application/pdf",
        })
        .field("type", "RESUME");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/applications/:id/documents — DOCX handling", () => {
    it("uploads a .docx file with correct type detection", async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie)
        .attach("file", path.join(fixturesDir, "checked.docx"))
        .field("type", "RESUME");

      expect(res.status).toBe(201);
      expect(res.body.data.mimetype).toBe(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
      expect(res.body.data.resourceType).toBe("raw");
    });

    it("successfully deletes a .docx file from both DB and Cloudinary", async () => {
      const uploadRes = await request(app)
        .post(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie)
        .attach("file", path.join(fixturesDir, "checked.docx"))
        .field("type", "OTHER");

      const documentId = uploadRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/v1/applications/${applicationA}/documents/${documentId}`)
        .set("Cookie", userA.cookie);

      expect(deleteRes.status).toBe(200);

      const listRes = await request(app)
        .get(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie);

      const found = listRes.body.data.find((doc) => doc.id === documentId);
      expect(found).toBeUndefined();
    });

    it("replaces a .docx RESUME with a .pdf RESUME correctly", async () => {
      const docxRes = await request(app)
        .post(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie)
        .attach("file", path.join(fixturesDir, "checked.docx"))
        .field("type", "RESUME");

      const pdfRes = await request(app)
        .post(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie)
        .attach("file", path.join(fixturesDir, "valid.pdf"))
        .field("type", "RESUME");

      expect(pdfRes.status).toBe(201);

      const listRes = await request(app)
        .get(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie);

      const resumes = listRes.body.data.filter((doc) => doc.type === "RESUME");
      expect(resumes.length).toBe(1);
      expect(resumes[0].id).toBe(pdfRes.body.data.id);
      expect(resumes[0].mimetype).toBe("application/pdf");
    });
  });

  describe("GET /api/v1/applications/:id/documents", () => {
    it("returns documents for the owner", async () => {
      const res = await request(app)
        .get(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("returns 404 when application belongs to a different user", async () => {
      const res = await request(app)
        .get(`/api/v1/applications/${applicationB}/documents`)
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(404);
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).get(
        `/api/v1/applications/${applicationA}/documents`,
      );
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/v1/applications/:id/documents/:documentId", () => {
    it("deletes the document for the owner", async () => {
      const uploadRes = await request(app)
        .post(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie)
        .attach("file", path.join(fixturesDir, "valid.pdf"))
        .field("type", "PORTFOLIO");

      const documentId = uploadRes.body.data.id;

      const res = await request(app)
        .delete(`/api/v1/applications/${applicationA}/documents/${documentId}`)
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(200);

      const listRes = await request(app)
        .get(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie);

      const found = listRes.body.data.find((doc) => doc.id === documentId);
      expect(found).toBeUndefined();
    });

    it("returns 404 for nonexistent document", async () => {
      const res = await request(app)
        .delete(`/api/v1/applications/${applicationA}/documents/nonexistent-id`)
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(404);
    });

    it("returns 404 when application belongs to a different user", async () => {
      const uploadRes = await request(app)
        .post(`/api/v1/applications/${applicationA}/documents`)
        .set("Cookie", userA.cookie)
        .attach("file", path.join(fixturesDir, "valid.pdf"))
        .field("type", "OTHER");

      const documentId = uploadRes.body.data.id;

      const res = await request(app)
        .delete(`/api/v1/applications/${applicationB}/documents/${documentId}`)
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(404);
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).delete(
        `/api/v1/applications/${applicationA}/documents/some-id`,
      );
      expect(res.status).toBe(401);
    });
  });
});
