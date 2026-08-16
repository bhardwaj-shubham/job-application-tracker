import prisma from "../config/db.js";

const create = (data) => {
  return prisma.application.create({
    data,
  });
};

const findById = (id, userId, { includeNotes = false } = {}) => {
  return prisma.application.findFirst({
    where: {
      id,
      userId,
    },
    ...(includeNotes && {
      include: {
        notes: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    }),
  });
};

const findMany = ({ userId, status, skip, take }) => {
  return prisma.application.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take,
  });
};

const count = ({ userId, status }) => {
  return prisma.application.count({
    where: {
      userId,
      ...(status && { status }),
    },
  });
};

const deleteById = (id) => {
  return prisma.application.delete({
    where: { id },
  });
};

const updateWithStatusHistory = async ({
  id,
  updateData,
  statusChanged,
  status,
}) => {
  const [application] = await prisma.$transaction([
    prisma.application.update({
      where: { id },
      data: updateData,
    }),

    ...(statusChanged
      ? [
          prisma.statusHistory.create({
            data: {
              applicationId: id,
              status,
            },
          }),
        ]
      : []),
  ]);

  return application;
};

export {
  create,
  findById,
  findMany,
  count,
  deleteById,
  updateWithStatusHistory,
};
