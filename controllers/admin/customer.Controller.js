import HTTP_STATUS from "../../constants/httpStatus.js";
import * as customerService from "../../services/admin/customer.service.js";


//customer list
const customerInfo = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 3;

    const { users, count } = await customerService.getCustomers({
      search,
      page,
      limit
    });

    res.render("users", {
      data: users,
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
    await customerService.updateUserBlockStatus(req.query.id, true);
    res.json({ success: true, status: "blocked" });
  } catch (error) {
    console.error("userBlocked error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false });
  }
};

//unblock user
const userUnblocked = async (req, res) => {
  try {
    await customerService.updateUserBlockStatus(req.query.id, false);
    res.json({ success: true, status: "active" });
  } catch (error) {
    console.error("userUnblocked error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false });
  }
};


//exports
export {
  customerInfo,
  userBlocked,
  userUnblocked
};
