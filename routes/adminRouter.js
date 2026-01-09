import express from "express";
const router = express.Router();

//controllers
import {loadDashboard,loadLogin,login,pageerror,logout} from "../controllers/admin/admin.controller.js";
import {categoryInfo, addCategory,activateCategory,inActiveCategory,editCategory,categoryOffer,deleteCategory} from "../controllers/admin/category.controller.js";
import {customerInfo,userBlocked,userUnblocked} from "../controllers/admin/customer.controller.js";
import {productInfo,loadAddproduct,addProducts,loadUpdateProduct,updateProduct,deleteProduct} from "../controllers/admin/product.controller.js";

//middlewares
import {adminAuth } from "../middlewares/auth.js";
import upload from "../middlewares/uploadImage.js";

//dashboard
router.get("/dashboard", adminAuth, loadDashboard);

//Auth
router.get("/login", loadLogin);
router.post("/login", login);
router.get("/page-error", pageerror);
router.get("/logout", adminAuth, logout);
//Customer Management
router.get("/users", adminAuth, customerInfo);
router.get("/blockUser", adminAuth, userBlocked);
router.get("/unblockUser", adminAuth, userUnblocked);

//Category management
router.get("/categories", adminAuth, categoryInfo);
router.post("/categories/add",adminAuth,
  (req, res, next) => {
    req.uploadFolder = "categories";
    next();
  },
  upload.single("image"),addCategory);
router.patch("/categories/:id/activate", adminAuth, activateCategory);
router.patch("/categories/:id/inactivate", adminAuth, inActiveCategory);
router.put("/categories/edit/:id",adminAuth,
  (req, res, next) => {
    req.uploadFolder = "categories";
    next();
  },
  upload.single("image"),editCategory);
router.patch("/categories/:id/offer", adminAuth, categoryOffer);
router.delete("/categories/:id", adminAuth, deleteCategory);

//Product management
router.get("/products", adminAuth, productInfo);
router.get("/products/add", adminAuth, loadAddproduct);
router.post("/products/add",adminAuth,
  (req, res, next) => {
    req.uploadFolder = "products";
    next();
  },
  upload.array("images", 3),addProducts);
router.get("/products/edit/:id",adminAuth,loadUpdateProduct);
router.put("/products/edit/:id",adminAuth,
  (req, res, next) => {
    req.uploadFolder = "products";
    next();
  },
  upload.array("images", 3),updateProduct);
router.delete("/products/:id", adminAuth, deleteProduct);


export default router;
