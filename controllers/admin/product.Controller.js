const Product = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const User = require ('../../models/userSchema');
const fs=require("fs/promises");
const path =require('path');
const sharp = require('sharp');
const { equal } = require('assert');
const HTTP_STATUS = require('../../helpers/httpStatus');



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
        res.redirect('/pageerror');
    }

};



function formattedName(string)
{
    splitted=string.split(" ");
    edited=splitted.map(word=>word.charAt(0).toUpperCase()+word.slice(1).toLowerCase());
    return edited=edited.join(" ");
}

const addProducts = async (req, res) => {
    try {
        const { productName, description, category, status, featured, variants } = req.body;
        // Validation
        if (!productName || !description || !category) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Product name, description, and category are required'
            });
        }
        const name=formattedName(productName);
        

        const productExists = await Product.findOne({
        productName: { $regex: new RegExp(`^${name}$`, 'i') },
        is_deleted: false
        });


        if (productExists) {
            // Delete uploaded files if product exists
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    await fs.unlink(file.path).catch(err => console.error(err));
                }
            }
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Product with this name already exists'
            });
        }
        // Validate images
        if (!req.files || req.files.length < 3) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'At least 3 product images are required'
            });
        }
        // Process variants
        let variantsArray = [];
        try {
            variantsArray = JSON.parse(variants);
        } catch (error) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid variants data'
            });
        }
        if (!variantsArray || variantsArray.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'At least one variant is required'
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
                message: 'Invalid category'
            });
        }

        // Generate SKU codes and validate variants
        const processedVariants = variantsArray.map((variant, index) => {
            if (!variant.size || !variant.price || variant.quantity === undefined) {
                throw new Error('All variant fields are required');
            }

            return {
                size: variant.size,
                sku_code: `${productName.substring(0, 3).toUpperCase()}-${variant.size.replace(/\s/g, '')}-${Date.now()}-${index}`,
                quantity: variant.quantity,
                regular_price: variant.price,
                sale_price: variant.price
            };
        });

        // Get image paths
        const imagePaths = req.files.map(file => `/uploads/products/${file.filename}`);
        const totalStock = processedVariants.reduce((sum, v) => sum + v.quantity, 0);

     
        

        // Create new product
        const newProduct = new Product({
            productName: name.trim(),
            description: description.trim(),
            category: categoryDoc._id,
            images: imagePaths,
            variants: processedVariants,
            stock: totalStock,
            status: status || 'Listed',
            featured: featured === 'true' || featured === true
        });

        await newProduct.save();

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Product added successfully',
            product: newProduct
        });

    }  catch (error) {
    console.error("Error adding product:", error);

    
    if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
            try {
                const filePath = path.join(__dirname, "../../public/uploads/products", file.filename);
                await fs.unlink(filePath);
            } catch (err) {
                console.error("Failed to delete uploaded image:", err);
            }
        }
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Something went wrong while adding the product"
    });
}
};




const loadEditProduct = async (req, res) => {
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


const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, description, category, status, featured, variants } = req.body;

    // Validation
    if (!productName || !description || !category) {
      return res.status(HTTP_STATUS. BAD_REQUEST).json({
        success: false,
        message: 'Product name, description, and category are required'
      });
    }

    const product = await Product.findOne({ _id: id, is_deleted: false });



    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND ).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }


     const productExists = await Product.findOne({
    productName: { $regex: new RegExp(`^${productName}$`, 'i') },
    is_deleted: false,
    _id: { $ne: id }  
});

if (productExists) {
    
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            await fs.unlink(file.path).catch(err => console.error(err));
        }
    }
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Product with this name already exists'
    });
}
    
    const categoryDoc = await Category.findOne({ 
      name: category,
      is_active: true,
      is_deleted: { $ne: true }
    });

    if (!categoryDoc) {
      return res.status(HTTP_STATUS. BAD_REQUEST).json({ 
        success: false, 
        message: 'Invalid category' 
      });
    }


    // Update basic fields
    product.productName = productName.trim();
    product.description = description.trim();
    product.category = categoryDoc._id;
    product.status = status;
    product.featured = featured === 'true' || featured === true;

    // Parse and validate variants
    let parsedVariants;
    try {
      parsedVariants = JSON.parse(variants);
    } catch (error) {
      return res.status(HTTP_STATUS. BAD_REQUEST).json({
        success: false,
        message: 'Invalid variants data'
      });
    }

    if (!parsedVariants || parsedVariants.length === 0) {
      return res.status(HTTP_STATUS. BAD_REQUEST).json({
        success: false,
        message: 'At least one variant is required'
      });
    }

    // Update variants with SKU code preservation
    product.variants = parsedVariants.map((v, index) => {
      if (!v.size || !v.price || v.quantity === undefined) {
        throw new Error('All variant fields are required');
      }

      const existingVariant = product.variants.find(
        existing => existing.size === v.size
      );

      return {
        size: v.size,
        quantity: parseInt(v.quantity),
        regular_price: parseFloat(v.price),
        sale_price: parseFloat(v.price),
        sku_code: existingVariant?.sku_code || 
                  `${productName.substring(0, 3).toUpperCase()}-${v.size.replace(/\s/g, '')}-${Date.now()}-${index}`
      };
    });

    product.stock = parsedVariants.reduce((sum, v) => sum + parseInt(v.quantity), 0);

    // Handle image removal
    if (req.body.removeImages) {
      const removeImages = Array.isArray(req.body.removeImages)
        ? req.body.removeImages
        : [req.body.removeImages];

      product.images = product.images.filter(img => !removeImages.includes(img));
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => `/uploads/products/${f.filename}`);
      product.images.push(...newImages);
    }

    // Validate EXACTLY 3 images
    if (product.images.length !== 3) {
      // Delete newly uploaded files if validation fails
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            await fs.unlink(path.join(__dirname, '../../public/uploads/products', file.filename));
          } catch (err) {
            console.error('Failed to delete uploaded image:', err);
          }
        }
      }
      
      return res.status(HTTP_STATUS. BAD_REQUEST).json({
        success: false,
        message: `Exactly 3 images required. Current count: ${product.images.length}`
      });
    }

    await product.save();

    res.json({ 
      success: true, 
      message: 'Product updated successfully' 
    });

  } catch (error) {
    console.error('Error updating product:', error);
    
    // Clean up uploaded files on error
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          await fs.unlink(path.join(__dirname, '../../public/uploads/products', file.filename));
        } catch (err) {
          console.error('Failed to delete uploaded image:', err);
        }
      }
    }
    
    res.status(HTTP_STATUS. INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: error.message || 'Failed to update product'
    });
  }
};


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



module.exports={
    productInfo,
    loadAddproduct,
    addProducts,
    loadEditProduct,
    updateProduct,
    deleteProduct
}