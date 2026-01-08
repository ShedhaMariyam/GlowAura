import Category from "../../models/categorySchema.js";
import Product from "../../models/productSchema.js";
import formattedName from "../../helpers/formattedName.js";

export const getCategories = async ({ page, limit, search })=>{
    const skip = (page - 1) * limit;

    const categories = await Category.find({
    is_deleted: { $ne: true },
    name: { $regex: search, $options: "i" }
    })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Category.countDocuments({
      is_deleted: { $ne: true },
      name: { $regex: search, $options: "i" }
    });

    return { categories, total };
}

//add category
export const createCategory = async ({ name, description, file }) => {
  const CategoryName = formattedName(name);

  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${CategoryName}$`, "i") },
    is_deleted: { $ne: true }
  });
    if (existingCategory) {
    throw new Error("CATEGORY_EXISTS");
  }

  const deletedCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${CategoryName}$`, "i") },
    is_deleted: true
  });

  if (deletedCategory) {
    deletedCategory.name = CategoryName;
    deletedCategory.description = description;
    deletedCategory.image = file.path;
    deletedCategory.is_deleted = false;
    deletedCategory.is_active = true;
    deletedCategory.deletedAt = null;

    await deletedCategory.save();
    return { reactivated: true };
  }

  if (!file) {
    throw new Error("IMAGE_REQUIRED");
  }

  const newCategory = new Category({
    name: CategoryName,
    description,
    image: file.path,
    is_active: true
  });

  await newCategory.save();
  return newCategory;

};

// activate/deactivate
export const updateCategoryStatus = async (id, status) => {
  await Category.updateOne(
    { _id: id },
    { $set: { is_active: status } }
  );
};

//category offer
export const updateCategoryOffer = async (id, percent) => {
  percent = Number(percent) || 0;
  const hasOffer = percent > 0;

  const category = await Category.findById(id);
  if (!category) throw new Error("NOT_FOUND");

  await Category.findByIdAndUpdate(id, {
    hasOffer,
    offerPercent: hasOffer ? percent : 0
  });

  const products = await Product.find({ category: id });

  for (const product of products) {
    product.variants = product.variants.map(v => {
      const discount = hasOffer
        ? (v.regular_price * percent) / 100
        : 0;

      return {
        ...v.toObject(),
        sale_price: v.regular_price - discount
      };
    });

    await product.save();
  }
};

// edit category
export const updateCategory = async ({ id, name, description, file }) => {
  const formatted = formattedName(name).trim();

  const existingCategory = await Category.findOne({
    _id: { $ne: id },
    name: formatted,
    is_deleted: { $ne: true }
  });

  if (existingCategory) {
    throw new Error("CATEGORY_EXISTS");
  }

  const update = { name: formatted, description };

  if (file) {
    update.image = file.path;
  }

  await Category.findByIdAndUpdate(id, { $set: update });
};

// Delete
export const softDeleteCategory = async (id) => {
  await Category.findByIdAndUpdate(id, {
    is_active: false,
    is_deleted: true
  });
};