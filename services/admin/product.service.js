import Product from "../../models/productSchema.js";
import Category from "../../models/categorySchema.js";
import formattedName from "../../helpers/formattedName.js";

//list product
export const getProducts = async ({ search, page, limit }) => {
  const skip = (page - 1) * limit;

  const activeCategories = await Category.find({ is_active: true }).select("_id");
  const activeCategoryIds = activeCategories.map(cat => cat._id);

  const filter = {
    is_deleted: false,
    category: { $in: activeCategoryIds }
  };

  if (search) {
    filter.productName = { $regex: search, $options: "i" };
  }

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("category");

  const count = await Product.countDocuments(filter);

  return { products, count };
};

export const activeCategory = async ()=>{
    const category = await Category.find({
            is_active: true,
            is_deleted: { $ne: true }
        });
     return {category}
}

//add product
export const createProduct = async ({productName,description,category,status,featured,variants,files}) => {
  const name = formattedName(productName);

  const productExists = await Product.findOne({
    productName: { $regex: new RegExp(`^${name}$`, "i") },
    is_deleted: false
  });

  if (productExists) throw new Error("Product with this name already exists");

  if (!files || files.length < 3) {
    throw new Error("At least 3 product images are required");
  }

  const variantsArray = JSON.parse(variants);
  if (!variantsArray.length) throw new Error("At least one variant is required");

  const categoryDoc = await Category.findOne({name: category,is_active: true,is_deleted: { $ne: true }});

  if (!categoryDoc) throw new Error("Invalid category");

  const processedVariants = variantsArray.map((v, i) => ({
    size: v.size,
    quantity: v.quantity,
    regular_price: v.price,
    sale_price: v.price,
    sku_code: `${name.substring(0, 3).toUpperCase()}-${v.size}-${Date.now()}-${i}`
  }));

  const images = files.map(file => ({
    url: file.path,
    public_id: file.filename
  }));

  const stock = processedVariants.reduce((s, v) => s + v.quantity, 0);

  const product = new Product({
    productName: name,
    description: description.trim(),
    category: categoryDoc._id,
    images,
    variants: processedVariants,
    stock,
    status: status || "Listed",
    featured: featured === "true" || featured === true
  });

  await product.save();
};

//get product for edit
export const getProductForEdit = async (id) => {
  const product = await Product.findOne({
    _id: id,
    is_deleted: false
  }).populate("category");

  const categories = await Category.find({
    is_active: true,
    is_deleted: { $ne: true }
  });

  return { product, categories };
};

//update product
export const updateProductById = async ({id,productName,description,category,status,featured,variants,files,removeImages}) => {
  const product = await Product.findOne({ _id: id, is_deleted: false });
  if (!product) throw new Error("Product not found");

  const name = formattedName(productName);

  const duplicate = await Product.findOne({
    productName: { $regex: new RegExp(`^${name}$`, "i") },
    is_deleted: false,
    _id: { $ne: id }
  });

  if (duplicate) throw new Error("Product with this name already exists");

  const categoryDoc = await Category.findOne({
    name: category,
    is_active: true,
    is_deleted: { $ne: true }
  });

  if (!categoryDoc) throw new Error("Invalid category");

  product.productName = name;
  product.description = description.trim();
  product.category = categoryDoc._id;
  product.status = status;
  product.featured = featured === "true" || featured === true;

  const parsedVariants = JSON.parse(variants);
  product.variants = parsedVariants.map((v, i) => ({
    size: v.size,
    quantity: v.quantity,
    regular_price: v.price,
    sale_price: v.price,
    sku_code:
      product.variants[i]?.sku_code ||
      `${name.substring(0, 3).toUpperCase()}-${v.size}-${Date.now()}-${i}`
  }));

  product.stock = parsedVariants.reduce((s, v) => s + v.quantity, 0);

  if (removeImages) {
    const removeArr = Array.isArray(removeImages)
      ? removeImages
      : [removeImages];
    product.images = product.images.filter(
      img => !removeArr.includes(img.url)
    );
  }

  if (files?.length) {
    product.images.push(
      ...files.map(file => ({url: file.path,public_id: file.filename})));
  }

  if (product.images.length !== 3) {
    throw new Error(`Exactly 3 images required`);
  }

  await product.save();
};

//delete product
export const softDeleteProduct = async (id) => {
  await Product.findByIdAndUpdate(id, {
    is_deleted: true,
    status: "Unlisted"
  });
};
