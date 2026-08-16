import prisma from "../config/db.js";

const create = ({ applicationId, content }) => {
  return prisma.note.create({
    data: { applicationId, content },
  });
};

const findMany = (applicationId) => {
  return prisma.note.findMany({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
  });
};

const findById = (id, applicationId) => {
  return prisma.note.findFirst({
    where: { id, applicationId },
  });
};

const updateById = (id, content) => {
  return prisma.note.update({
    where: { id },
    data: { content },
  });
};

const deleteById = (id) => {
  return prisma.note.delete({
    where: { id },
  });
};

export { create, findMany, findById, updateById, deleteById };
