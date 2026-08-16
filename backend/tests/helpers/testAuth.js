import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/config/db.js";

const createTestUser = async (suffix = "") => {
  const email = `test-${Date.now()}${suffix}@example.com`;
  const password = "password123";
  const name = "Test User";

  await request(app)
    .post("/api/v1/auth/signup")
    .send({ name, email, password });

  const loginRes = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });

  const cookie = loginRes.headers["set-cookie"];
  const userId = loginRes.body.data.user.id;

  return { email, cookie, userId };
};

const cleanupTestUser = async (userId) => {
  await prisma.user
    .delete({
      where: {
        id: userId,
      },
    })
    .catch(() => {});
};

export { createTestUser, cleanupTestUser };
