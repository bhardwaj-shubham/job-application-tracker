import { describe, it, expect, vi, beforeEach } from "vitest";

import { ApplicationStatus } from "../../generated/prisma/enums.ts";
import * as applicationRepository from "../../src/repositories/application.repository.js";

import {
  createApplication,
  listApplications,
  getApplicationById,
  updateApplication,
  deleteAplication,
} from "../../src/services/application.service.js";

vi.mock("../../src/repositories/application.repository.js", () => ({
  create: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  findById: vi.fn(),
  updateWithStatusHistory: vi.fn(),
  deleteById: vi.fn(),
}));

describe("application.service - createApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an application with default values", async () => {
    const userId = "user-123";

    const createdApplication = {
      id: "app-123",
      company: "Google",
      role: "Software Engineer",
      jobUrl: null,
      status: ApplicationStatus.APPLIED,
      appliedDate: new Date(),
      jobDescription: null,
      userId,
    };

    applicationRepository.create.mockResolvedValue(createdApplication);

    const result = await createApplication({
      company: "Google",
      role: "Software Engineer",
      userId,
    });

    expect(applicationRepository.create).toHaveBeenCalledWith({
      company: "Google",
      role: "Software Engineer",
      jobUrl: null,
      status: ApplicationStatus.APPLIED,
      appliedDate: expect.any(Date),
      jobDescription: null,
      userId,
    });

    expect(result).toEqual(createdApplication);
  });

  it("should preserve provided optional values", async () => {
    const appliedDate = new Date("2026-08-15");

    applicationRepository.create.mockResolvedValue({
      id: "app-123",
    });

    await createApplication({
      company: "Google",
      role: "Backend Engineer",
      jobUrl: "https://google.com/jobs/123",
      status: ApplicationStatus.INTERVIEWING,
      appliedDate,
      jobDescription: "Node.js backend position",
      userId: "user-123",
    });

    expect(applicationRepository.create).toHaveBeenCalledWith({
      company: "Google",
      role: "Backend Engineer",
      jobUrl: "https://google.com/jobs/123",
      status: ApplicationStatus.INTERVIEWING,
      appliedDate,
      jobDescription: "Node.js backend position",
      userId: "user-123",
    });
  });
});

describe("application.service - listApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list applications with correct pagination", async () => {
    const applications = [
      { id: "app-1", company: "Google" },
      { id: "app-2", company: "Microsoft" },
    ];

    applicationRepository.findMany.mockResolvedValue(applications);
    applicationRepository.count.mockResolvedValue(25);

    const result = await listApplications({
      userId: "user-123",
      page: 3,
      limit: 10,
    });

    expect(applicationRepository.findMany).toHaveBeenCalledWith({
      userId: "user-123",
      status: undefined,
      skip: 20,
      take: 10,
    });

    expect(applicationRepository.count).toHaveBeenCalledWith({
      userId: "user-123",
      status: undefined,
    });

    expect(result).toEqual({
      applications,
      pagination: {
        currentPage: 3,
        totalPages: 3,
        totalItems: 25,
        limit: 10,
      },
    });
  });

  it("should pass status filter to repository", async () => {
    applicationRepository.findMany.mockResolvedValue([]);
    applicationRepository.count.mockResolvedValue(0);

    await listApplications({
      userId: "user-123",
      page: 1,
      limit: 10,
      status: ApplicationStatus.INTERVIEWING,
    });

    expect(applicationRepository.findMany).toHaveBeenCalledWith({
      userId: "user-123",
      status: ApplicationStatus.INTERVIEWING,
      skip: 0,
      take: 10,
    });

    expect(applicationRepository.count).toHaveBeenCalledWith({
      userId: "user-123",
      status: ApplicationStatus.INTERVIEWING,
    });
  });
});

describe("application.service - getApplicationById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return application by id", async () => {
    const application = {
      id: "app-123",
      company: "Google",
      role: "Backend Engineer",
      notes: [],
    };

    applicationRepository.findById.mockResolvedValue(application);

    const result = await getApplicationById({
      id: "app-123",
      userId: "user-123",
    });

    expect(applicationRepository.findById).toHaveBeenCalledWith(
      "app-123",
      "user-123",
      {
        includeNotes: true,
      },
    );

    expect(result).toEqual(application);
  });

  it("should return null when application does not exist", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    const result = await getApplicationById({
      id: "missing-id",
      userId: "user-123",
    });

    expect(applicationRepository.findById).toHaveBeenCalledWith(
      "missing-id",
      "user-123",
      {
        includeNotes: true,
      },
    );

    expect(result).toBeNull();
  });
});

describe("application.service - updateApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null when application does not exist", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    const result = await updateApplication({
      id: "missing-id",
      userId: "user-123",
      company: "Google",
    });

    expect(applicationRepository.findById).toHaveBeenCalledWith(
      "missing-id",
      "user-123",
    );

    expect(
      applicationRepository.updateWithStatusHistory,
    ).not.toHaveBeenCalled();

    expect(result).toBeNull();
  });

  it("should update application without changing status", async () => {
    applicationRepository.findById.mockResolvedValue({
      id: "app-123",
      status: ApplicationStatus.APPLIED,
    });

    const updatedApplication = {
      id: "app-123",
      company: "Google",
      status: ApplicationStatus.APPLIED,
    };

    applicationRepository.updateWithStatusHistory.mockResolvedValue(
      updatedApplication,
    );

    const result = await updateApplication({
      id: "app-123",
      userId: "user-123",
      company: "Google",
    });

    expect(applicationRepository.updateWithStatusHistory).toHaveBeenCalledWith({
      id: "app-123",
      updateData: {
        company: "Google",
      },
      statusChanged: false,
      status: undefined,
    });

    expect(result).toEqual(updatedApplication);
  });

  it("should detect status change", async () => {
    applicationRepository.findById.mockResolvedValue({
      id: "app-123",
      status: ApplicationStatus.APPLIED,
    });

    const updatedApplication = {
      id: "app-123",
      status: ApplicationStatus.INTERVIEWING,
    };

    applicationRepository.updateWithStatusHistory.mockResolvedValue(
      updatedApplication,
    );

    const result = await updateApplication({
      id: "app-123",
      userId: "user-123",
      status: ApplicationStatus.INTERVIEWING,
    });

    expect(applicationRepository.updateWithStatusHistory).toHaveBeenCalledWith({
      id: "app-123",
      updateData: {
        status: ApplicationStatus.INTERVIEWING,
      },
      statusChanged: true,
      status: ApplicationStatus.INTERVIEWING,
    });

    expect(result).toEqual(updatedApplication);
  });

  it("should not detect status change when status remains the same", async () => {
    applicationRepository.findById.mockResolvedValue({
      id: "app-123",
      status: ApplicationStatus.APPLIED,
    });

    const updatedApplication = {
      id: "app-123",
      status: ApplicationStatus.APPLIED,
    };

    applicationRepository.updateWithStatusHistory.mockResolvedValue(
      updatedApplication,
    );

    const result = await updateApplication({
      id: "app-123",
      userId: "user-123",
      status: ApplicationStatus.APPLIED,
    });

    expect(applicationRepository.updateWithStatusHistory).toHaveBeenCalledWith({
      id: "app-123",
      updateData: {
        status: ApplicationStatus.APPLIED,
      },
      statusChanged: false,
      status: ApplicationStatus.APPLIED,
    });

    expect(result).toEqual(updatedApplication);
  });

  it("should convert empty optional fields to null", async () => {
    applicationRepository.findById.mockResolvedValue({
      id: "app-123",
      status: ApplicationStatus.APPLIED,
    });

    applicationRepository.updateWithStatusHistory.mockResolvedValue({
      id: "app-123",
    });

    await updateApplication({
      id: "app-123",
      userId: "user-123",
      jobUrl: "",
      jobDescription: "",
    });

    expect(applicationRepository.updateWithStatusHistory).toHaveBeenCalledWith({
      id: "app-123",
      updateData: {
        jobUrl: null,
        jobDescription: null,
      },
      statusChanged: false,
      status: undefined,
    });
  });
});

describe("application.service - deleteAplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null when application does not exist", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    const result = await deleteAplication({
      id: "missing-id",
      userId: "user-123",
    });

    expect(applicationRepository.findById).toHaveBeenCalledWith(
      "missing-id",
      "user-123",
    );

    expect(applicationRepository.deleteById).not.toHaveBeenCalled();

    expect(result).toBeNull();
  });

  it("should delete the application when it exists", async () => {
    const application = {
      id: "app-123",
      userId: "user-123",
    };

    const deletedApplication = {
      id: "app-123",
    };

    applicationRepository.findById.mockResolvedValue(application);
    applicationRepository.deleteById.mockResolvedValue(deletedApplication);

    const result = await deleteAplication({
      id: "app-123",
      userId: "user-123",
    });

    expect(applicationRepository.findById).toHaveBeenCalledWith(
      "app-123",
      "user-123",
    );

    expect(applicationRepository.deleteById).toHaveBeenCalledWith("app-123");

    expect(result).toEqual(deletedApplication);
  });
});
