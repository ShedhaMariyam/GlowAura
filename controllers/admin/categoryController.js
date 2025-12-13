
const Category = require('../../models/categorySchema');
const Product = require('../../models/productSchema')

const categoryInfo = async (req,res)=>{
    try {
            const page = parseInt(req.query.page) || 1;
            const limit = 4;
            const skip = (page-1)*limit;
            const search = req.query.search || "";


            const categoryData = await Category.find({
                name: { $regex: search, $options: "i" }}) 
                .sort({ _id: -1 })
                .skip(skip)
                .limit(limit);

            
           

            const totalCategories = await Category.countDocuments({
                name: { $regex: search, $options: "i" }});


            const totalPages = Math.ceil(totalCategories/limit);

            res.render("category",{
                cat:categoryData,
                search,
                currentPage:page,
                totalPages : totalPages,
                resultsCount : totalCategories,
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
    const existingCategory = await Category.findOne({name});
    if(existingCategory){
      return res.status(400).json({error : "Category already exists"});
    }

 
    if (!req.file) {
      return res.status(400).json({ error: "Category image is required" });
    }

    const imagePath = '/uploads/categories/' + req.file.filename;

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
};


const activateCategory = async(req,res)=>{
    try{
        const { id } = req.params;
        console.log(id);
        await Category.updateOne({_id:id},{$set : {is_active:true}})
        return res.json({ success: true });
    } catch (error) {
        console.error("Activate Category Error:", error);
        res.redirect('/page-error')
    }
}

const inActiveCategory = async(req,res)=>{
    try{
        const { id } = req.params;
        console.log(id);
        await Category.updateOne({_id:id},{$set : {is_active:false}})
        return res.json({ success: true });
    } catch (error) {
        console.error("Inactivate Category Error:", error);
        res.redirect('/page-error')
    }
}

const categoryOffer = async (req, res) => {
  try {
    const { id } = req.params;
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
    product.variants = product.variants.map(v => {
    const discount = (v.regular_price * percent) / 100;

    return {
      ...v.toObject(),
      sale_price: v.regular_price - discount   // discounted price
    };
  });
} else {
  
  product.variants = product.variants.map(v => {
    return {
      ...v.toObject(),
      sale_price: v.regular_price
    };
  });
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

    return res.status(201).json({success: true, message: "Category updated successfully" });

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