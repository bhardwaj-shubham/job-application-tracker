import prisma from "../config/db.js";

const create = async (applicationId, model, promptVersion) => {
  return prisma.resumeAnalysis.create({
    data: {
      applicationId,
      model,
      promptVersion,
    },
  });
};

const findByApplicationId = async (applicationId) => {
  return prisma.resumeAnalysis.findUnique({
    where: { applicationId },
  });
};

const updateToPending = async (analysisId) => {
  return prisma.resumeAnalysis.update({
    where: { id: analysisId },
    data: {
      status: "PENDING",
      errorCode: null,
      errorMessage: null,
    },
  });
};

const updateToProcessing = async (analysisId) => {
  return prisma.resumeAnalysis.update({
    where: { id: analysisId },
    data: { status: "PROCESSING" },
  });
};

const updateToCompleted = async (analysisId, analysisData) => {
  return prisma.resumeAnalysis.update({
    where: { id: analysisId },
    data: {
      ...analysisData,
      status: "COMPLETED",
      errorCode: null,
      errorMessage: null,
    },
  });
};

const updateToFailed = async (analysisId, errorCode, errorMessage) => {
  return prisma.resumeAnalysis.update({
    where: { id: analysisId },
    data: {
      status: "FAILED",
      errorCode,
      errorMessage,
    },
  });
};

export {
  create,
  findByApplicationId,
  updateToPending,
  updateToProcessing,
  updateToCompleted,
  updateToFailed,
};
