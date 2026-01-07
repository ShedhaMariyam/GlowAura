import Product from "../../models/productSchema.js";
import Category from "../../models/categorySchema.js";
import HTTP_STATUS from "../../helpers/httpStatus.js";
import formattedName from "../../helpers/formattedName.js";





const productInfo = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

  
    const activeCategories = await Category.find({ is_active: true }).select('_id');
    const activeCategoryIds = activeCategories.map(cat => cat._id);

    
    const filter = {
    is_deleted: false,
    category: { $in: activeCategoryIds }
    };

    if (search) {
    filter.productName = { $regex: search, $options: "i" };
    }

    const productData = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category')
      .exec();

    const count = await Product.countDocuments(filter);
   
    const totalPages = Math.ceil(count / limit);

    res.render("products", {
      data: productData,
      currentPage: page,
      totalPages,
      resultsCount: count,
      search,
      activePage: "products"
    });

  } catch (error) {
    console.error(error);
    res.redirect('/page-error');
  }
};




const loadAddproduct= async (req,res)=>{

    try {
        const category = await Category.find({
            is_active: true,
            is_deleted: { $ne: true }
        });

        res.render("addProducts",{cat:category,activePage: "products"});

    } catch (error) {
      console.error(error);
      res.redirect('/pageerror');
    }

};





const addProducts = async (req, res) => {
  try {
    const { productName, description, category, status, featured, variants } = req.body;

    //validation
    if (!productName || !description || !category) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Product name, description, and category are required"
      });
    }

    const name = formattedName(productName);
    //duplicate name checking
    const productExists = await Product.findOne({
      productName: { $regex: new RegExp(`^${name}$`, "i") },
      is_deleted: false
    });

    if (productExists) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Product with this name already exists"
      });
    }
    //validating image 
    if (!req.files || req.files.length < 3) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "At least 3 product images are required"
      });
    }
    //process variants
    let variantsArray;
    try {
      variantsArray = JSON.parse(variants);
    } catch {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid variants data"
      });
    }

  if (!Array.isArray(variantsArray) || variantsArray.length === 0) {
   return res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    message: "At least one variant is required"
  });
}


    const categoryDoc = await Category.findOne({
      name: category,
      is_active: true,
      is_deleted: { $ne: true }
    });

    if (!categoryDoc) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid category"
      });
    }
    // Generate SKU codes and validate variants
    const processedVariants = variantsArray.map((v, i) => ({
      size: v.size,
      quantity: v.quantity,
      regular_price: v.price,
      sale_price: v.price,
      sku_code: `${name.substring(0, 3).toUpperCase()}-${v.size}-${Date.now()}-${i}`
    }));

    const images = req.files.map(file => ({
                    url: file.path,
                    public_id: file.filename
                  }))
    const stock = processedVariants.reduce((s, v) => s + v.quantity, 0);

    // Create new product
    const newProduct = new Product({
      productName: name,
      description: description.trim(),
      category: categoryDoc._id,
      images,
      variants: processedVariants,
      stock,
      status: status || "Listed",
      featured: featured === "true" || featured === true
    });

    await newProduct.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Product added successfully"
    });

  } catch (error) {
    console.error("Add product error:", error);
     res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong"
    });
  }
};

//load update product page
const loadUpdateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findOne({
    _id: productId,
    is_deleted: false
    }).populate('category');

    const categories = await Category.find({ is_active: true,is_deleted: { $ne: true } });

    if (!product) {
      return res.redirect('/admin/products');
    }

    res.render('editProduct', {
      product,
      cat: categories,
      activePage: "products"
    });

  } catch (error) {
    console.error(error);
    res.redirect('/page-error');
  }
};

//update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, description, category, status, featured, variants } = req.body;

    //basic validation
    if (!productName || !description || !category) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Product name, description, and category are required"
      });
    }

    const product = await Product.findOne({ _id: id, is_deleted: false });
    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Product not found"
      });
    }

    const name = formattedName(productName);
    //duplicate name check
    const productExists = await Product.findOne({
      productName: { $regex: new RegExp(`^${name}$`, "i") },
      is_deleted: false,
      _id: { $ne: id }
    });

    if (productExists) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Product with this name already exists"
      });
    }

    //category validation
    const categoryDoc = await Category.findOne({
      name: category,
      is_active: true,
      is_deleted: { $ne: true }
    });

    if (!categoryDoc) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid category"
      });
    }

    //update basic fields
    product.productName = name.trim();
    product.description = description.trim();
    product.category = categoryDoc._id;
    product.status = status;
    product.featured = featured === "true" || featured === true;

    //parse and validate variants
    let parsedVariants;
    try {
      parsedVariants = JSON.parse(variants);
    } catch {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid variants data"
      });
    }

    if (!parsedVariants.length) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "At least one variant is required"
      });
    }

    product.variants = parsedVariants.map((v, index) => {
      if (!v.size || !v.price || v.quantity === undefined) {
        throw new Error("All variant fields are required");
      }

      const existingVariant = product.variants.find(ev => ev.size === v.size);

      return {
        size: v.size,
        quantity: parseInt(v.quantity),
        regular_price: parseFloat(v.price),
        sale_price: parseFloat(v.price),
        sku_code:
          existingVariant?.sku_code ||
          `${productName.substring(0, 3).toUpperCase()}-${v.size.replace(/\s/g, "")}-${Date.now()}-${index}`
      };
    });

    product.stock = parsedVariants.reduce(
      (sum, v) => sum + parseInt(v.quantity),
      0
    );

    //remove image
if (req.body.removeImages) {
  const removeImages = Array.isArray(req.body.removeImages)
    ? req.body.removeImages
    : [req.body.removeImages];

  product.images = product.images.filter(
    img => !removeImages.includes(img.public_id)
  );
}


    //Add new image
    if (req.files?.length) {
  const newImages = req.files.map(file => ({
    url: file.path,
    public_id: file.filename
  }));

  product.images.push(...newImages);
}

    //validate image count
    if (product.images.length !== 3) {
    
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Exactly 3 images required. Current count: ${product.images.length}`
      });
    }

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully"
    });

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to update product"
    });
  }
};

//delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await Product.findByIdAndUpdate(id, {

      is_deleted: true,
      status: "Unlisted"
    });

    return res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS. INTERNAL_SERVER_ERROR).json({ success: false, message: "Delete failed" });
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