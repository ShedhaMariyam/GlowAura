import User from '../../models/userSchema.js';
import HTTP_STATUS from '../../helpers/httpStatus.js';
import {getHomePageData,getShopProducts,getProductDetails} from "../../services/user/product.services.js";

// 404 Page
const pageNotFound = async (req, res) => {
  try {
    res.render('page-404');
  } catch (error) {
    console.error(error);
    res.redirect('/pageNotFound');
  }
};


// Home Page
const loadHomepage = async (req, res) => {
  
  try {
    const userId = req.session.user;
    const { categories, products } = await getHomePageData();

    if (userId) {
      const userData = await User.findById(userId).lean();
      return res.render("home", {
        user: userData,
        products,
        categories
      });
    }else{
      return res.render("home", { products, categories });
    }
     
  } catch (error) {
    console.error("Home page not found :",error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server error");
  }
};

// Products Page
const loadProducts = async (req, res) => {
  try {
    const search = req.query.search || "";
    const selectedCategory = req.query.cat || "";
    const sort = req.query.sort || "latest";
    const page = parseInt(req.query.page) || 1;
    const limit = 6;

    const {products,categories,totalPages} = await getShopProducts({search,selectedCategory,sort,page: parseInt(page),limit});

    const userData = req.session.user? await User.findById(req.session.user).lean(): null;

    res.render("shop", {
      user: userData,
      products,
      category: categories,
      totalPages,
      currentPage: page,
      search,
      selectedCategory,
      sort
    });

  } catch (error) {
    console.error("Shop Error:", error);
    res.redirect("/pageNotFound");
  }
};


const loadProductDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const data = await getProductDetails(id);
    if (!data) return res.redirect("/pageNotFound");

    res.render("productDetails", {
      product: data.product,
      cat: data.product.category,
      featuredProducts: data.featuredProducts
    });

  } catch (error) {
    console.log("Product Details page not found", error);
    res.redirect('/pageNotFound');
  }
};


export {
  loadHomepage,
  pageNotFound,
  loadProducts,
  loadProductDetails,
};
