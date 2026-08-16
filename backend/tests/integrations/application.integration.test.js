import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { createTestUser, cleanupTestUser } from "../helpers/testAuth.js";

describe("Application endpoints", () => {
  let userA, userB;

  beforeAll(async () => {
    userA = await createTestUser("-a");
    userB = await createTestUser("-b");
  });

  afterAll(async () => {
    await cleanupTestUser(userA.userId);
    await cleanupTestUser(userB.userId);
  });

  describe("POST /api/v1/applications", () => {
    it("creates an application with valid data", async () => {
      const res = await request(app)
        .post("/api/v1/applications")
        .set("Cookie", userA.cookie)
        .send({ company: "Acme", role: "Backend Engineer" });

      expect(res.status).toBe(201);
      expect(res.body.data.company).toBe("Acme");
      expect(res.body.data.status).toBe("APPLIED");
      expect(res.body.data.userId).toBeUndefined();
    });

    it("returns 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/v1/applications")
        .set("Cookie", userA.cookie)
        .send({ company: "Acme" });

      expect(res.status).toBe(400);
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app)
        .post("/api/v1/applications")
        .send({ company: "Acme", role: "Backend Engineer" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/applications", () => {
    let createdIds = [];

    beforeAll(async () => {
      for (const status of ["APPLIED", "INTERVIEWING", "APPLIED"]) {
        const res = await request(app)
          .post("/api/v1/applications")
          .set("Cookie", userA.cookie)
          .send({ company: "TestCo", role: "Engineer", status });
        createdIds.push(res.body.data.id);
      }
    });

    it("returns default pagination", async () => {
      const res = await request(app)
        .get("/api/v1/applications")
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.currentPage).toBe(1);
      expect(res.body.data.pagination.limit).toBe(10);
      expect(res.body.data.applications.length).toBeGreaterThan(0);
    });

    it("respects page and limit params", async () => {
      const res = await request(app)
        .get("/api/v1/applications?page=1&limit=2")
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.applications.length).toBeLessThanOrEqual(2);
      expect(res.body.data.pagination.limit).toBe(2);
    });

    it("filters by status", async () => {
      const res = await request(app)
        .get("/api/v1/applications?status=INTERVIEWING")
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(200);
      res.body.data.applications.forEach((app) => {
        expect(app.status).toBe("INTERVIEWING");
      });
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).get("/api/v1/applications");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/applications/:id", () => {
    let applicationId;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/applications")
        .set("Cookie", userA.cookie)
        .send({ company: "Detail Co", role: "Engineer" });
      applicationId = res.body.data.id;
    });

    it("returns the application for its owner", async () => {
      const res = await request(app)
        .get(`/api/v1/applications/${applicationId}`)
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(applicationId);
      expect(res.body.data.notes).toEqual([]);
    });

    it("returns 404 for nonexistent application", async () => {
      const res = await request(app)
        .get("/api/v1/applications/nonexistent-id")
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(404);
    });

    it("returns 404 when application belongs to a different user", async () => {
      const res = await request(app)
        .get(`/api/v1/applications/${applicationId}`)
        .set("Cookie", userB.cookie);

      expect(res.status).toBe(404);
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).get(
        `/api/v1/applications/${applicationId}`,
      );
      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/v1/applications/:id", () => {
    let applicationId;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/applications")
        .set("Cookie", userA.cookie)
        .send({ company: "Update Co", role: "Engineer" });
      applicationId = res.body.data.id;
    });

    it("updates fields for the owner", async () => {
      const res = await request(app)
        .patch(`/api/v1/applications/${applicationId}`)
        .set("Cookie", userA.cookie)
        .send({ jobDescription: "Updated description" });

      expect(res.status).toBe(200);
      expect(res.body.data.jobDescription).toBe("Updated description");
    });

    it("returns 400 for empty body", async () => {
      const res = await request(app)
        .patch(`/api/v1/applications/${applicationId}`)
        .set("Cookie", userA.cookie)
        .send({});

      expect(res.status).toBe(400);
    });

    it("creates a StatusHistory entry on status change", async () => {
      const res = await request(app)
        .patch(`/api/v1/applications/${applicationId}`)
        .set("Cookie", userA.cookie)
        .send({ status: "OFFERED" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("OFFERED");

      const detailRes = await request(app)
        .get(`/api/v1/applications/${applicationId}`)
        .set("Cookie", userA.cookie);

      expect(detailRes.body.data.status).toBe("OFFERED");
    });

    it("returns 404 when application belongs to a different user", async () => {
      const res = await request(app)
        .patch(`/api/v1/applications/${applicationId}`)
        .set("Cookie", userB.cookie)
        .send({ company: "Hijacked" });

      expect(res.status).toBe(404);
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app)
        .patch(`/api/v1/applications/${applicationId}`)
        .send({ company: "Anon" });

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/v1/applications/:id", () => {
    it("deletes the application for its owner", async () => {
      const createRes = await request(app)
        .post("/api/v1/applications")
        .set("Cookie", userA.cookie)
        .send({ company: "Delete Co", role: "Engineer" });
      const applicationId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/v1/applications/${applicationId}`)
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/v1/applications/${applicationId}`)
        .set("Cookie", userA.cookie);

      expect(getRes.status).toBe(404);
    });

    it("returns 404 for nonexistent application", async () => {
      const res = await request(app)
        .delete("/api/v1/applications/nonexistent-id")
        .set("Cookie", userA.cookie);

      expect(res.status).toBe(404);
    });

    it("returns 404 when application belongs to a different user", async () => {
      const createRes = await request(app)
        .post("/api/v1/applications")
        .set("Cookie", userA.cookie)
        .send({ company: "Protected Co", role: "Engineer" });
      const applicationId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/v1/applications/${applicationId}`)
        .set("Cookie", userB.cookie);

      expect(res.status).toBe(404);
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).delete("/api/v1/applications/some-id");
      expect(res.status).toBe(401);
    });
  });
});
