import User from "../../models/userSchema.js";
import HTTP_STATUS from "../../helpers/httpStatus.js";

//customer list
const customerInfo = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 3;

    const userData = await User.find({
      is_admin: false,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } }
      ]
    })
      .sort({ createdOn: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments({
      is_admin: false,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } }
      ]
    });

    res.render("users", {
      data: userData,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      resultsCount: count,
      search,
      activePage: "users"
    });
  } catch (error) {
    console.error("customerInfo error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .redirect("/page-error");
  }
};

//block user
const userBlocked = async (req, res) => {
  try {
    const { id } = req.query;
    await User.updateOne({ _id: id }, { $set: { is_Blocked: true } });
    res.redirect("/admin/users");
  } catch (error) {
    console.error("userBlocked error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .redirect("/page-error");
  }
};

//unblock user
const userUnblocked = async (req, res) => {
  try {
    const { id } = req.query;
    await User.updateOne({ _id: id }, { $set: { is_Blocked: false } });
    res.redirect("/admin/users");
  } catch (error) {
    console.error("userUnblocked error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .redirect("/page-error");
  }
};

//exports
export {
  customerInfo,
  userBlocked,
  userUnblocked
};
