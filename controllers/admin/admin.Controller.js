import User from "../../models/userSchema.js";
import bcrypt from "bcrypt";
import HTTP_STATUS from "../../helpers/httpStatus.js";

//page error
const pageerror = (req, res) => {
  try {
    res.render("admin-error");
  } catch (error) {
    console.error(error);
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

    const admin = await User.findOne({ email, is_admin: true });

    if (!admin) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .render("admin-login", {
          message: "Invalid credentials — Admin access denied"
        });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .render("admin-login", {
          message: "Invalid credentials — Admin access denied"
        });
    }

    req.session.admin = admin._id;
    return res.redirect("/admin/dashboard");

  } catch (error) {
    console.error("login error:", error);
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
    console.error("load dashboard error:", error);
    res.redirect("/page-error");
  }
};

//logout
const logout = async (req, res) => {
  try {
    req.session.destroy(err => {
      if (err) {
        console.error("Error destroying session", err);
        return res.redirect("/page-error");
      }
      res.redirect("/admin/login");
    });
  } catch (error) {
    console.error("unexpected logout error", error);
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
