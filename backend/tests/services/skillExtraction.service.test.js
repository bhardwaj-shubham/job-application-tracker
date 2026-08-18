import { describe, expect, it, vi, beforeEach } from "vitest";
import * as applicationRepository from "../../src/repositories/application.repository.js";
import skillExtractionQueue from "../../src/queues/skillExtraction.queue.js";
import {
  enqueueSkillExtraction,
  getJobStatus,
} from "../../src/services/skillExtraction.service.js";

vi.mock("../../src/repositories/application.repository.js", () => ({
  findById: vi.fn(),
}));

vi.mock("../../src/queues/skillExtraction.queue.js", () => {
  return {
    default: {
      add: vi.fn(),
      getJob: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("skillExtraction.service - enqueueSkillExtraction", () => {
  it("returns applicationNotFound when application does not belong user", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    const result = await enqueueSkillExtraction({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(skillExtractionQueue.add).not.toHaveBeenCalled();
    expect(result).toEqual({
      applicationNotFound: true,
    });
  });

  it("enqueues a job with the application's jobDescription when found", async () => {
    applicationRepository.findById.mockResolvedValue({
      id: "app-1",
      jobDescription: "We need a backend engineer with Node.js experience",
    });
    skillExtractionQueue.add.mockResolvedValue({ id: "job-123" });

    const result = await enqueueSkillExtraction({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(skillExtractionQueue.add).toHaveBeenCalledWith(
      "extract-skills",
      expect.objectContaining({
        applicationId: "app-1",
        jobDescription: "We need a backend engineer with Node.js experience",
      }),
    );
    expect(result).toEqual({ jobId: "job-123" });
  });
});

describe("skillExtraction.service - getJobStatus", () => {
  it("returns applicationNotFound when application does not exist", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    const result = await getJobStatus({
      jobId: "job-1",
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(skillExtractionQueue.getJob).not.toHaveBeenCalled();
    expect(result).toEqual({
      applicationNotFound: true,
    });
  });

  it("returns null when job does not exist", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    skillExtractionQueue.getJob.mockResolvedValue(null);

    const result = await getJobStatus({
      jobId: "nonexistent-job",
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toBeNull();
  });

  it("returns null when job exists but belongs to a different application", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    skillExtractionQueue.getJob.mockResolvedValue({
      id: "job-1",
      data: { applicationId: "some-other-app" },
    });

    const result = await getJobStatus({
      jobId: "job-1",
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toBeNull();
  });

  it("returns job status and result when everything matches", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    const mockJob = {
      id: "job-1",
      data: { applicationId: "app-1" },
      getState: vi.fn().mockResolvedValue("completed"),
      returnvalue: { skills: ["JavaScript", "Node.js"] },
      failedReason: null,
    };
    skillExtractionQueue.getJob.mockResolvedValue(mockJob);

    const result = await getJobStatus({
      jobId: "job-1",
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toEqual({
      jobId: "job-1",
      status: "completed",
      result: { skills: ["JavaScript", "Node.js"] },
      failureReason: null,
    });
  });
});
