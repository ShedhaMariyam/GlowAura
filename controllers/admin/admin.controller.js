import HTTP_STATUS from "../../constants/httpStatus.js";
import { authenticateAdmin } from "../../services/admin/adminAuth.service.js";
import logger from "../../utils/logger.js"

//page error
const pageerror = (req, res) => {
  try {
    res.render("admin-error");
  } catch (error) {
    logger.error("Admin error page render failed", error);
    res.redirect("/page-error");
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
const login = async (req, res) => {
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
    logger.error("Admin login error", error);
    return res.redirect("/page-error");
  }
};

//dashboard
const loadDashboard = async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.redirect("/admin/login");
    }

    res.render("dashboard", {
      user: { name: "Admin User" },
      activePage: "dashboard"
    });
  } catch (error) {
    logger.error("Admin dashboard load error", error);
    res.redirect("/page-error");
  }
};

//logout
const logout = async (req, res) => {
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
    logger.error("Unexpected admin logout error", error);
    res.redirect("/page-error");
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
