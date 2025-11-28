const Product = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const User = require ('../../models/userSchema');
const fs=require('fs');
const path =require('path');
const sharp = require('sharp');



const productInfo = async (req,res)=>{
    try {
            const page = parseInt(req.query.page) || 1;
            const limit = 4;
            const skip = (page-1)*limit;

            const productData = await Product.find({})
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit);

            const totalProducts = await Product.countDocuments();
            const totalPages = Math.ceil(totalProducts/limit);
            res.render("productDetails",{
                product:productData,
                currentPage:page,
                totalPages : totalPages,
                totalProducts : totalProducts
            });

    } catch (error) {
        console.error(error)
        res.redirect('/page-error')
    }
}


const loadAddproduct= async (req,res)=>{
    try {
        
        const category = await Category.find ({is_active : true});
        res.render("addProducts",{cat:category});

    } catch (error) {
        res.redirect('/pageerror');
    }
}

module.exports={
    productInfo,
    loadAddproduct
}