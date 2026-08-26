import { describe, it, expect, afterEach, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/config/db.js";
import resetRateLimits from "../helpers/resetRateLimits.js";

describe("Auth endpoints", () => {
  let createdUserIds = [];

  beforeEach(async () => {
    await resetRateLimits();
  });

  afterEach(async () => {
    for (const id of createdUserIds) {
      await prisma.user.delete({ where: { id } }).catch(() => {});
    }
    createdUserIds = [];
  });

  describe("POST /api/v1/auth/signup", () => {
    it("creates a user with valid data", async () => {
      const email = `signup-${Date.now()}@example.com`;

      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({ name: "Test User", email, password: "password123" });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe(email);
      expect(res.body.data.password).toBeUndefined();

      createdUserIds.push(res.body.data.id);
    });

    it("returns 400 for missing fields", async () => {
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({ email: "incomplete@example.com" });

      expect(res.status).toBe(400);
    });

    it("returns 400 for short password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Test",
          email: `short-${Date.now()}@example.com`,
          password: "short",
        });

      expect(res.status).toBe(400);
    });

    it("returns 409 for duplicate email", async () => {
      const email = `dup-${Date.now()}@example.com`;

      const firstRes = await request(app)
        .post("/api/v1/auth/signup")
        .send({ name: "Test", email, password: "password123" });
      createdUserIds.push(firstRes.body.data.id);

      const secondRes = await request(app)
        .post("/api/v1/auth/signup")
        .send({ name: "Test Again", email, password: "password456" });

      expect(secondRes.status).toBe(409);
    });

    it("normalizes email to lowercase", async () => {
      const email = `MixedCase-${Date.now()}@Example.com`;

      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({ name: "Test", email, password: "password123" });

      expect(res.body.data.email).toBe(email.toLowerCase());
      createdUserIds.push(res.body.data.id);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    let email, password;

    it("logs in with correct credentials", async () => {
      email = `login-${Date.now()}@example.com`;
      password = "password123";

      const signupRes = await request(app)
        .post("/api/v1/auth/signup")
        .send({ name: "Test", email, password });
      createdUserIds.push(signupRes.body.data.id);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email, password });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("returns 401 for wrong password", async () => {
      const email = `wrongpw-${Date.now()}@example.com`;
      const signupRes = await request(app)
        .post("/api/v1/auth/signup")
        .send({ name: "Test", email, password: "correctpassword" });
      createdUserIds.push(signupRes.body.data.id);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email, password: "wrongpassword" });

      expect(res.status).toBe(401);
    });

    it("returns 401 for nonexistent user", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "nonexistent@example.com", password: "password123" });

      expect(res.status).toBe(401);
    });

    it("returns 400 for missing fields", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("returns current user when authenticated", async () => {
      const email = `me-${Date.now()}@example.com`;
      const password = "password123";

      const signupRes = await request(app)
        .post("/api/v1/auth/signup")
        .send({ name: "Test", email, password });
      createdUserIds.push(signupRes.body.data.id);

      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email, password });
      const cookie = loginRes.headers["set-cookie"];

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(email);
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).get("/api/v1/auth/me");
      expect(res.status).toBe(401);
    });

    it("returns 401 with an invalid token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", ["token=invalid.token.here"]);

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("clears the auth cookie and invalidates the session", async () => {
      const email = `logout-${Date.now()}@example.com`;
      const password = "password123";

      const signupRes = await request(app)
        .post("/api/v1/auth/signup")
        .send({ name: "Test", email, password });
      createdUserIds.push(signupRes.body.data.id);

      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email, password });
      const cookie = loginRes.headers["set-cookie"];

      const logoutRes = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", cookie);
      expect(logoutRes.status).toBe(200);

      const clearedCookie = logoutRes.headers["set-cookie"];
      const meRes = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", clearedCookie);

      expect(meRes.status).toBe(401);
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).post("/api/v1/auth/logout");
      expect(res.status).toBe(401);
    });
  });
});
