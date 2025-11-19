const express = require ('express');
const router = express.Router();
const adminController = require ('../controllers/admin/adminController');
const {userAuth,adminAuth} = require('../middlewares/auth');


router.get('/dashboard',adminAuth, adminController.loadDashboard);

router.get('/login', adminController.loadLogin);
router.post('/login', adminController.login);

router.get('/pageerror', adminController.pageerror);

router.get('/logout',adminController.logout);
//router.get('/user',adminAuth,customerController.customerInfo);

module.exports = router