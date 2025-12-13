const Product = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const User = require ('../../models/userSchema');
const fs=require("fs/promises");
const path =require('path');
const sharp = require('sharp');
const { equal } = require('assert');



const productInfo = async (req,res)=>{
    try {
            const search = req.query.search || "";
            const page = req.query.page || 1;
            const limit = 4;
            const skip = (page-1)*limit;

            const productData = await Product.find({
                    productName:{$regex:new RegExp(".*"+search+".*","i")}
                   })
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit).populate('category').exec();
            const count = await Product.find({
                    productName:{$regex:new RegExp(".*"+search+".*","i")},
            }).countDocuments();

            const category = await Category.find({is_active:true});
            const totalPages = Math.ceil(count/limit);
            if(category){
                res.render("products",{
                data:productData,
                currentPage:page,
                totalPages : totalPages,
                resultsCount : count,
                cat:category,
                search,
                activePage: "products"
            });
            }
            else{
                res.rendert('page-404')
            }
            

    } catch (error) {
        console.error(error)
        res.redirect('/page-error')
    }
}




const loadAddproduct= async (req,res)=>{

    try {
        const category = await Category.find({is_active:true});
        res.render("addProducts",{cat:category,activePage: "products"});

    } catch (error) {
        res.redirect('/pageerror');
    }

};





const addProducts = async (req, res) => {
    try {
        const { productName, description, category, status, featured, variants } = req.body;
        // Validation
        if (!productName || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Product name, description, and category are required'
            });
        }

        // Check if product already exists
        const productExists = await Product.findOne({
            productName: { $regex: new RegExp(`^${productName}$`, 'i') }
        });

        if (productExists) {
            // Delete uploaded files if product exists
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    await fs.unlink(file.path).catch(err => console.error(err));
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Product with this name already exists'
            });
        }
        // Validate images
        if (!req.files || req.files.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'At least 3 product images are required'
            });
        }
        // Process variants
        let variantsArray = [];
        try {
            variantsArray = JSON.parse(variants);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid variants data'
            });
        }
        if (!variantsArray || variantsArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one variant is required'
            });
        }
      
        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
            return res.status(400).json({
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
            productName: productName.trim(),
            description: description.trim(),
            category: categoryDoc._id,
            images: imagePaths,
            variants: processedVariants,
            stock: totalStock,
            status: status || 'Listed',
            featured: featured === 'true' || featured === true
        });

        await newProduct.save();

        res.status(201).json({
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

    return res.status(500).json({
        success: false,
        message: "Something went wrong while adding the product"
    });
}
};




const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete product images
        for (const imagePath of product.images) {
            const fullPath = path.join(__dirname, '../public', imagePath);
            await fs.unlink(fullPath).catch(err => console.error(err));
        }

        await Product.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product'
        });
    }
};

module.exports={
    productInfo,
    loadAddproduct,
    addProducts
}