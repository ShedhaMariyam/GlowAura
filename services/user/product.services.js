import Category from "../../models/categorySchema.js";
import Product from "../../models/productSchema.js";
import mongoose from "mongoose";

//home page data
export const getHomePageData = async () => {
    const categories = await Category.find({is_active: true,is_deleted: false});
    const products = await Product.find({status: "Listed",is_deleted: false,stock: { $gt: 0 },featured: true,category: { $in: categories.map(cat => cat._id) }})
        .sort({ createdAt: -1 })
        .limit(4);
return { categories, products };
};

//product page
export const getShopProducts = async ({search,selectedCategory,sort,page,limit}) => {

  const skip = (page - 1) * limit;
  const categories = await Category.find({ is_active: true }).select("_id name").lean();

  const categoryIds = categories.map(cat => cat._id);
  let matchStage = { status: "Listed" };

  if (selectedCategory) {
    matchStage.category = new mongoose.Types.ObjectId(selectedCategory);
  } else {
    matchStage.category = { $in: categoryIds };
  }

  if (search) {
    matchStage.productName = { $regex: search, $options: "i" };
  }

  let sortStage = { createdAt: -1 };
  if (sort === "low") sortStage = { firstSalePrice: 1 };
  if (sort === "high") sortStage = { firstSalePrice: -1 };

  const products = await Product.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        firstSalePrice: { $arrayElemAt: ["$variants.sale_price", 0] }
      }
    },
    { $sort: sortStage },
    { $skip: skip },
    { $limit: limit }
  ]);

  const totalProducts = await Product.countDocuments(matchStage);
  const totalPages = Math.ceil(totalProducts / limit);

  return { products, categories, totalPages };
};

//product Details
export const getProductDetails = async(productId)=>{
    const product = await Product.findById(productId).populate('category');
    if (!product) return null;

    const featuredProducts = await Product.find({featured: true,_id: { $ne: productId }})
      .sort({ createdAt: -1 })   
      .limit(4)
      .lean();
      
    return { product, featuredProducts };
} 

