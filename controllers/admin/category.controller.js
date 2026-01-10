
import HTTP_STATUS from "../../constants/httpStatus.js";
import * as categoryService from "../../services/admin/category.service.js"

//Category List
const categoryInfo = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const search = (req.query.search || "").trim();

    const { categories, total } = await categoryService.getCategories({page,limit,search});

    res.render("category", {
      cat: categories,
      search,
      currentPage: page,
      totalPages : Math.ceil(total / limit),
      resultsCount: total,
      activePage: "categories"
    });
  } catch (error) {
    console.error(error);
    res.redirect("/page-error");
  }
};

//Add Category
const addCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory({
      name: req.body.name,
      description: req.body.description,
      file: req.file
    });

    if (category?.reactivated) {
      return res.json({ success: true, message: "Category reactivated successfully" });
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Category Added Successfully",
      category: {
        "_id": "...",
        "name": "...",
        "description": "...",
        "image": "..."}
    });
  } catch (error) {
    if (error.message === "CATEGORY_EXISTS") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Category already exists" });
    }
    if (error.message === "IMAGE_REQUIRED") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Category image is required" });
    }

    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
  }
};


//Active or Inactive
const activateCategory = async (req, res) => {
  await categoryService.updateCategoryStatus(req.params.id, true);
  res.json({ success: true });
};

const inActiveCategory = async (req, res) => {
  await categoryService.updateCategoryStatus(req.params.id, false);
  res.json({ success: true });
};


//Category Offer
const categoryOffer = async (req, res) => {
  try {
    await categoryService.updateCategoryOffer(req.params.id, req.body.percent);
    res.json({ success: true, message: "Offer updated" });
  } catch (error) {
    console.error(error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error"
    });
  }
};

//edit category
const editCategory = async (req, res) => {
  try {
    await categoryService.updateCategory({
      id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      file: req.file
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Category updated successfully"
    });
  } catch (error) {
    if (error.message === "CATEGORY_EXISTS") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Category with this name already exists"
      });
    }

    res.json({ error: "Internal server error" });
  }
};

//delete Category
const deleteCategory = async (req, res) => {
  try {
    await categoryService.softDeleteCategory(req.params.id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error(error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error"
    });
  }
};


//exports
export {
  categoryInfo,
  addCategory,
  activateCategory,
  inActiveCategory,
  categoryOffer,
  editCategory,
  deleteCategory
};
