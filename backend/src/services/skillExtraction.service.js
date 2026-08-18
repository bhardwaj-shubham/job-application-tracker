import skillExtractionQueue from "../queues/skillExtraction.queue.js";
import * as applicationRepository from "../repositories/application.repository.js";

const verifyApplicationOwnership = async (applicationId, userId) => {
  return applicationRepository.findById(applicationId, userId);
};

const enqueueSkillExtraction = async ({ applicationId, userId }) => {
  const application = await verifyApplicationOwnership(applicationId, userId);

  if (!application) {
    return { applicationNotFound: true };
  }

  const job = await skillExtractionQueue.add("extract-skills", {
    applicationId,
    jobDescription: application.jobDescription,
  });

  return { jobId: job.id };
};

const getJobStatus = async ({ jobId, applicationId, userId }) => {
  const application = await verifyApplicationOwnership(applicationId, userId);

  if (!application) {
    return { applicationNotFound: true };
  }

  const job = await skillExtractionQueue.getJob(jobId);

  if (!job || job.data.applicationId !== applicationId) {
    return null;
  }

  return {
    jobId: job.id,
    status: await job.getState(),
    result: job.returnvalue ?? null,
    failureReason: job.failedReason ?? null,
  };
};

export { enqueueSkillExtraction, getJobStatus };
