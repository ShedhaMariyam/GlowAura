const express = require ('express');
const router = express.Router();
const adminController = require ('../controllers/admin/adminController');
const {userAuth,adminAuth} = require('../middlewares/auth');
const customerController = require ('../controllers/admin/customerController')

router.get('/dashboard',adminAuth, adminController.loadDashboard);
// login management
router.get('/login', adminController.loadLogin);
router.post('/login', adminController.login);
router.get('/pageerror', adminController.pageerror);
router.get('/logout',adminController.logout);

//Costomer management
router.get('/users',adminAuth,customerController.customerInfo);
router.get('/blockUser',adminAuth,customerController.userBlocked);
router.get('/unblockUser',adminAuth,customerController.userUnblocked)



module.exports = router