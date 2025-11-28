
const Category = require('../../models/categorySchema');
const Product = require('../../models/productSchema')

const categoryInfo = async (req,res)=>{
    try {
            const page = parseInt(req.query.page) || 1;
            const limit = 4;
            const skip = (page-1)*limit;

            const categoryData = await Category.find({})
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit);

            const totalCategories = await Category.countDocuments();
            const totalPages = Math.ceil(totalCategories/limit);
            res.render("category",{
                cat:categoryData,
                currentPage:page,
                totalPages : totalPages,
                totalCategories : totalCategories,
                activePage: "categories"
            },);

    } catch (error) {
        console.error(error)
        res.redirect('/page-error')
    }
}

const addCategory = async (req,res)=>{
    const {name,description} = req.body;
    try {
        const existingCategory = await Category.findOne({name})
        if(existingCategory){
            return res.status(400).json({error : "Category already exists"});
            }

        // handle uploaded image
        let imagePath = null;
             if (req.file) {
                imagePath = '/uploads/categories/' + req.file.filename;
             }
        const newCategory = new Category({
            name,
            description,
            image: imagePath,
            is_active : true
        });

        await newCategory.save();


         return res.status(201).json({ message: "Category Added" });
    } catch (error) {
        console.error("Add Category Error:", error);
        return res.status(500).json({error: "Internal server error"});
    }
}

const activateCategory = async(req,res)=>{
    try{
        let id = req.query.id;
        await Category.updateOne({_id:id},{$set : {is_active:true}})
        res.redirect('/admin/categories')
    } catch (error) {
        console.error("Activate Category Error:", error);
        res.redirect('/page-error')
    }
}

const inActiveCategory = async(req,res)=>{
    try{
        let id = req.query.id;
        await Category.updateOne({_id:id},{$set : {is_active:false}})
        res.redirect('/admin/categories')
    } catch (error) {
        console.error("Inactivate Category Error:", error);
        res.redirect('/page-error')
    }
}

const categoryOffer = async (req, res) => {
  try {
    const { id } = req.query;
    let { percent } = req.body;

    percent = Number(percent) || 0;
    const hasOffer = percent > 0;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await Category.findByIdAndUpdate(id, {
      hasOffer,
      offerPercent: hasOffer ? percent : 0,
    });

    const products = await Product.find({ category: id });

    for (const product of products) {
      if (hasOffer) {
        const discount = (product.regular_price * percent) / 100;
        product.sale_price = product.regular_price - discount;
      } else {
        product.sale_price = product.regular_price; // Reset on OFF
      }
      await product.save();
    }

    return res.json({ success: true, message: "Offer updated" });
  } catch (err) {
    console.error("Offer error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



const editCategory = async (req, res) => {
  try {
    console.log('EDIT CATEGORY HIT:', req.body.id);
    const id= req.params.id;
    const {  name, description } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Category id is required" });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const trimmedName = name.trim();

    const existingCategory = await Category.findOne({
      _id: { $ne: id },
      name: trimmedName
    });

    if (existingCategory) {
      return res.status(400).json({ error: "Category with this name already exists" });
    }

    const update = { name: trimmedName, description };

    if (req.file) {
      update.image = '/uploads/categories/' + req.file.filename;
    }

    await Category.findByIdAndUpdate(id, { $set: update });

    return res.status(200).json({ message: "Category updated successfully" });

  } catch (error) {
    console.error("Edit Category Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports={
    categoryInfo,
    addCategory,
    activateCategory,
    inActiveCategory,
    categoryOffer,
    editCategory
}