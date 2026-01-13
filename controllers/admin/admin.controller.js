import HTTP_STATUS from "../../constants/httpStatus.js";
import { authenticateAdmin } from "../../services/admin/adminAuth.service.js";
import logger from "../../utils/logger.js"

//page error
const pageerror = (req, res, next) => {
  try {
    res.render("admin-error");
  } catch (error) {
    next(error);
  }
};

//load login
const loadLogin = (req, res) => {
  if (req.session.admin) {
    return res.redirect("/admin/dashboard");
  }
  res.render("admin-login", { message: null });
};

//login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await authenticateAdmin(email, password);

    if (!admin) {
      logger.warn(`Failed admin login attempt: ${email}`);
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .render("admin-login", {
          message: "Invalid credentials — Admin access denied"
        });
    }

    req.session.admin = admin._id;
    logger.info(`Admin logged in: ${email}`);

    return res.redirect("/admin/dashboard");

  } catch (error) {
   next(error);
  }
};

//dashboard
const loadDashboard = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      return res.redirect("/admin/login");
    }

    res.render("dashboard", {
      user: { name: "Admin User" },
      activePage: "dashboard"
    });
  } catch (error) {
    next(error);
  }
};

//logout
const logout = async (req, res , next) => {
  try {
    req.session.destroy(err => {
      if (err) {
        logger.error("Admin logout session destroy failed", err);
        return res.redirect("/page-error");
      }
      logger.info("Admin logged out");
      res.redirect("/admin/login");
    });
  } catch (error) {
    next(error);
  }
};

//export
export {
  loadLogin,
  login,
  loadDashboard,
  pageerror,
  logout
};
