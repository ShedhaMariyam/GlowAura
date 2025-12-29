
const User = require('../../models/userSchema');
const Category = require ('../../models/categorySchema');
const Product = require ('../../models/productSchema');
const HTTP_STATUS = require('../../helpers/httpStatus');


const test = async (req, res) => {
  try {
    const userId = req.session.user;
    const categories = await Category.find({is_active:true,is_deleted:false});
    let productData = await Product.find({status:'Listed',is_deleted:false,category:{$in:categories.map(category=>category._id)},stock:{$gt:0},featured : true}).sort({ createdAt: -1 }).limit(4);
    
    
    if (userId) {
      const userData = await User.findById(userId);
     return res.render('test', 
      { 
        user: userData, 
        products : productData,
        categories: categories 
       });
    }

    else{
      return res.render('test',{products : productData,categories: categories});
    }
     
  } catch (error) {
    console.log("Home page not found");
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server error");
  }
};


// 404 Page
const pageNotFound = async (req, res) => {
  try {
    res.render('page-404');
  } catch (error) {
    res.redirect('/pageNotFound');
  }
};


// Home Page
const loadHomepage = async (req, res) => {
  try {
    const userId = req.session.user;
    const categories = await Category.find({is_active:true,is_deleted:false});
    let productData = await Product.find({status:'Listed',is_deleted:false,category:{$in:categories.map(category=>category._id)},stock:{$gt:0},featured : true}).sort({ createdAt: -1 }).limit(4);
    
    
    if (userId) {
      const userData = await User.findById(userId);
     return res.render('home', 
      { 
        user: userData, 
        products : productData,
        categories: categories 
       });
    }

    else{
      return res.render('home',{products : productData,categories: categories});
    }
     
  } catch (error) {
    console.log("Home page not found");
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
    const skip = (page - 1) * limit;

   
    const categories = await Category.find({ is_active: true }).select("_id name").lean();
    const categoryIds = categories.map(cat => cat._id);

    
    let filter = {
      status: 'Listed',
      category: selectedCategory ? selectedCategory : { $in: categoryIds }
    };

    if (search) {
      filter.productName = { $regex: search, $options: "i" };
    }


    let sortStage = { createdAt: -1 };
    if (sort === "low") sortStage = { "variants.sale_price": 1 };
    if (sort === "high") sortStage = { "variants.sale_price": -1 };


    const products = await Product.find(filter)
      .sort(sortStage)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    let userData = req.session.user ? await User.findById(req.session.user).lean() : null;

    res.render('shop', {
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
    res.redirect('/pageNotFound');
  }
};




const loadProductDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id).populate('category');
    if (!product) return res.redirect('/pageNotFound');

  
    const featuredProducts = await Product.find({
      featured: true,
      _id: { $ne: id }
    })
      .sort({ createdAt: -1 })   
      .limit(4);               

    res.render('productDetails', {
      product,
      cat: product.category,
      featuredProducts
    });
  } catch (error) {
    console.log("Product Details page not found", error);
    res.redirect('/pageNotFound');
  }
};



module.exports = {
  test,
  loadHomepage,
  pageNotFound,
  loadProducts,
  loadProductDetails,

};
