import prisma from "../config/db.js";

const create = (data) => {
  return prisma.document.create({ data });
};

const findMany = (applicationId) => {
  return prisma.document.findMany({
    where: {
      applicationId,
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });
};

const findById = (id, applicationId) => {
  return prisma.document.findFirst({
    where: {
      id,
      applicationId,
    },
  });
};

const findByApplicationByType = (applicationId, type) => {
  return prisma.document.findFirst({
    where: {
      applicationId,
      type,
    },
  });
};

const deleteById = (id) => {
  return prisma.document.delete({
    where: { id },
  });
};

export { create, findMany, findById, findByApplicationByType, deleteById };
