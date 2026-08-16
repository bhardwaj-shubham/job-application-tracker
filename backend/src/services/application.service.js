import { ApplicationStatus } from "../../generated/prisma/enums.ts";
import * as applicationRepository from "../repositories/application.repository.js";

const createApplication = async ({
  company,
  role,
  jobUrl,
  status,
  appliedDate,
  jobDescription,
  userId,
}) => {
  return applicationRepository.create({
    company,
    role,
    jobUrl: jobUrl || null,
    status: status || ApplicationStatus.APPLIED,
    appliedDate: appliedDate || new Date(),
    jobDescription: jobDescription || null,
    userId,
  });
};

const listApplications = async ({ userId, page, limit, status }) => {
  const skip = (page - 1) * limit;

  const [applications, totalItems] = await Promise.all([
    applicationRepository.findMany({
      userId,
      status,
      skip,
      take: limit,
    }),

    applicationRepository.count({
      userId,
      status,
    }),
  ]);

  return {
    applications,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      limit,
    },
  };
};

const getApplicationById = async ({ id, userId }) => {
  const application = await applicationRepository.findById(id, userId, {
    includeNotes: true,
  });
  return application;
};

const updateApplication = async ({
  id,
  userId,
  company,
  role,
  jobUrl,
  status,
  appliedDate,
  jobDescription,
}) => {
  const existingApplication = await applicationRepository.findById(id, userId);

  if (!existingApplication) {
    return null;
  }

  const updateData = {
    ...(company !== undefined && { company }),
    ...(role !== undefined && { role }),
    ...(jobUrl !== undefined && { jobUrl: jobUrl || null }),
    ...(status !== undefined && { status }),
    ...(appliedDate !== undefined && {
      appliedDate,
    }),
    ...(jobDescription !== undefined && {
      jobDescription: jobDescription || null,
    }),
  };

  const statusChanged =
    status !== undefined && status !== existingApplication.status;

  return applicationRepository.updateWithStatusHistory({
    id,
    updateData,
    statusChanged,
    status,
  });
};

const deleteAplication = async ({ id, userId }) => {
  const existingApplication = await applicationRepository.findById(id, userId);

  if (!existingApplication) {
    return null;
  }

  return applicationRepository.deleteById(id);
};

export {
  createApplication,
  listApplications,
  getApplicationById,
  updateApplication,
  deleteAplication,
};
