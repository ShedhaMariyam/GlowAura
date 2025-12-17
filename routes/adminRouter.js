const express = require ('express');
const router = express.Router();
const adminController = require ('../controllers/admin/adminController');
const categoryController = require('../controllers/admin/categoryController');
const customerController = require ('../controllers/admin/customerController');
const productController = require ('../controllers/admin/productController')
const {userAuth,adminAuth} = require('../middlewares/auth');
const uploadCategoryImage = require('../middlewares/uploadCategoryImage');
const uploadProductImages = require('../middlewares/uploadProductImages');



router.get('/dashboard',adminAuth, adminController.loadDashboard);
// login management
router.get('/login', adminController.loadLogin);
router.post('/login', adminController.login);
router.get('/page-error', adminController.pageerror);
router.get('/logout',adminController.logout);

//Costomer management
router.get('/users',adminAuth,customerController.customerInfo);
router.get('/blockUser',adminAuth,customerController.userBlocked);
router.get('/unblockUser',adminAuth,customerController.userUnblocked)

//category management
router.get('/categories',adminAuth,categoryController.categoryInfo);
router.post('/categories/add',adminAuth,uploadCategoryImage.single('image'),categoryController.addCategory)
router.patch('/categories/:id/activate', adminAuth, categoryController.activateCategory);
router.patch('/categories/:id/inactivate', adminAuth, categoryController.inActiveCategory);
router.put('/categories/edit/:id',adminAuth,uploadCategoryImage.single('image'),categoryController.editCategory);
router.patch('/categories/:id/offer', adminAuth, categoryController.categoryOffer);


//Product Management
router.get('/products',adminAuth,productController.productInfo);
router.get('/products/add',adminAuth,productController.loadAddproduct);
router.post('/products/add', uploadProductImages.array('images', 3),productController.addProducts);
router.get('/products/edit/:id', productController.loadEditProduct);
router.put('/products/edit/:id', uploadProductImages.array('images', 5), productController.updateProduct);
module.exports = router