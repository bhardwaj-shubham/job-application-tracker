import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";

import app from "../../src/app.js";
import { createTestUser, cleanupTestUser } from "../helpers/testAuth.js";

describe("Note endpoints", () => {
  let userA, userB;
  let applicationA, applicationB, otherApplicationA;

  beforeAll(async () => {
    userA = await createTestUser("-notes-a");
    userB = await createTestUser("-notes-b");

    const createApp = async (cookie, company) => {
      const res = await request(app)
        .post("/api/v1/applications")
        .set("Cookie", cookie)
        .send({ company, role: "Engineer" });
      return res.body.data.id;
    };

    applicationA = await createApp(userA.cookie, "App A");
    otherApplicationA = await createApp(userA.cookie, "App A - Second");
    applicationB = await createApp(userB.cookie, "App B");
  });

  afterAll(async () => {
    await cleanupTestUser(userA.userId);
    await cleanupTestUser(userB.userId);
  });

  describe("POST /api/v1/applications/:id/notes", () => {
    it("creates a note for the owner", async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationA}/notes`)
        .set("Cookie", userA.cookie)
        .send({ content: "Recruiter called" });

      expect(res.status).toBe(201);
      expect(res.body.data.content).toBe("Recruiter called");
    });

    it("returns 400 for empty content", async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationA}/notes`)
        .set("Cookie", userA.cookie)
        .send({ content: "" });

      expect(res.status).toBe(400);
    });

    it("returns 404 when application belongs to a different user", async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationB}/notes`)
        .set("Cookie", userA.cookie)
        .send({ content: "Should not work" });

      expect(res.status).toBe(404);
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationA}/notes`)
        .send({ content: "Anon note" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/applications/:id/notes", () => {
    it("returns notes for the owner", async () => {
      const res = await request(app)
        .get(`/api/v1/applications/${applicationA}/notes`)
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("returns 404 when application belongs to a different user", async () => {
      const res = await request(app)
        .get(`/api/v1/applications/${applicationB}/notes`)
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(404);
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).get(
        `/api/v1/applications/${applicationA}/notes`,
      );
      expect(res.status).toBe(401);
    });

    it("returns an empty array when application has no notes", async () => {
      const res = await request(app)
        .get(`/api/v1/applications/${otherApplicationA}/notes`)
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("PATCH /api/v1/applications/:id/notes/:noteId — cross-application isolation", () => {
    let noteIdOnApplicationA;

    beforeAll(async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationA}/notes`)
        .set("Cookie", userA.cookie)
        .send({ content: "Original note" });
      noteIdOnApplicationA = res.body.data.id;
    });

    it("updates the note when it belongs to the specified application", async () => {
      const res = await request(app)
        .patch(
          `/api/v1/applications/${applicationA}/notes/${noteIdOnApplicationA}`,
        )
        .set("Cookie", userA.cookie)
        .send({ content: "Updated note" });

      expect(res.status).toBe(200);
      expect(res.body.data.content).toBe("Updated note");
    });

    it("returns 404 when the note exists but belongs to a DIFFERENT application (same user)", async () => {
      // This is the critical cross-application isolation test —
      // the note genuinely exists and the user owns both applications,
      // but the noteId/applicationId pair doesn't match.
      const res = await request(app)
        .patch(
          `/api/v1/applications/${otherApplicationA}/notes/${noteIdOnApplicationA}`,
        )
        .set("Cookie", userA.cookie)
        .send({ content: "Should not work" });

      expect(res.status).toBe(404);
    });

    it("returns 404 when the application belongs to a different user", async () => {
      const res = await request(app)
        .patch(
          `/api/v1/applications/${applicationB}/notes/${noteIdOnApplicationA}`,
        )
        .set("Cookie", userA.cookie)
        .send({ content: "Should not work" });

      expect(res.status).toBe(404);
    });

    it("returns 400 for empty content", async () => {
      const res = await request(app)
        .patch(
          `/api/v1/applications/${applicationA}/notes/${noteIdOnApplicationA}`,
        )
        .set("Cookie", userA.cookie)
        .send({ content: "" });

      expect(res.status).toBe(400);
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app)
        .patch(
          `/api/v1/applications/${applicationA}/notes/${noteIdOnApplicationA}`,
        )
        .send({ content: "Anon update" });

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/v1/applications/:id/notes/:noteId", () => {
    it("deletes the note when it belongs to the specified application", async () => {
      const createRes = await request(app)
        .post(`/api/v1/applications/${applicationA}/notes`)
        .set("Cookie", userA.cookie)
        .send({ content: "To be deleted" });
      const noteId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/v1/applications/${applicationA}/notes/${noteId}`)
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(200);
    });

    it("returns 404 when the note exists but belongs to a different application", async () => {
      const createRes = await request(app)
        .post(`/api/v1/applications/${applicationA}/notes`)
        .set("Cookie", userA.cookie)
        .send({ content: "Cross-app delete attempt" });
      const noteId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/v1/applications/${otherApplicationA}/notes/${noteId}`)
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(404);
    });

    it("returns 404 when the application belongs to a different user", async () => {
      const createRes = await request(app)
        .post(`/api/v1/applications/${applicationA}/notes`)
        .set("Cookie", userA.cookie)
        .send({ content: "Cross-user delete attempt" });
      const noteId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/v1/applications/${applicationB}/notes/${noteId}`)
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(404);
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).delete(
        `/api/v1/applications/${applicationA}/notes/some-note-id`,
      );
      expect(res.status).toBe(401);
    });
  });
});
