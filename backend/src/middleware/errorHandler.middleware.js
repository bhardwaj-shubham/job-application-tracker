import ERROR_CODES from "../constants/errorCodes.js";

const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];
  const code = err.code || ERROR_CODES.INTERNAL_ERROR;

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    code,
  });
};

export default errorHandlerMiddleware;
