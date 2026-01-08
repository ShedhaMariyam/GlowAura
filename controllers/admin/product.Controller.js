import HTTP_STATUS from "../../helpers/httpStatus.js";
import * as productService from "../../services/admin/product.service.js";

const productInfo = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 4;

    const { products, count } = await productService.getProducts({
      search,
      page,
      limit
    });

    res.render("products", {
      data: products,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      resultsCount: count,
      search,
      activePage: "products"
    });
  } catch (error) {
    console.error(error);
    res.redirect("/page-error");
  }
};



const loadAddproduct= async (req,res)=>{

    try {
        const {category} = await productService.activeCategory();
        res.render("addProducts",{cat:category,activePage: "products"});

    } catch (error) {
      console.error(error);
      res.redirect('/pageerror');
    }

};

const addProducts = async (req, res) => {
  try {
    await productService.createProduct({
      ...req.body,
      files: req.files
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Product added successfully"
    });
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
};


//load update product page
const loadUpdateProduct = async (req, res) => {
  try {
    const { product, categories } =
      await productService.getProductForEdit(req.params.id);

    if (!product) return res.redirect("/admin/products");

    res.render("editProduct", {
      product,
      cat: categories,
      activePage: "products"
    });
  } catch (error) {
    console.error(error);
    res.redirect("/page-error");
  }
};


//update product
const updateProduct = async (req, res) => {
  try {
    await productService.updateProductById({
      id: req.params.id,
      ...req.body,
      files: req.files
    });

    res.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
};


//delete product
const deleteProduct = async (req, res) => {
  try {
    await productService.softDeleteProduct(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: "Delete failed" });
  }
};


//exports
export{
    productInfo,
    loadAddproduct,
    addProducts,
    loadUpdateProduct,
    updateProduct,
    deleteProduct
}