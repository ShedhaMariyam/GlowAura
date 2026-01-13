import logger from "../utils/logger.js";
import HTTP_STATUS from "../constants/httpStatus.js";

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  if (req.originalUrl.startsWith("/admin")) {
    return res.redirect("/page-error");
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default errorHandler;
