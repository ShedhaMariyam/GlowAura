const express = require ('express')
const router = express.Router();
const passport= require ('passport')
const userController = require('../controllers/user/user.Controller.js');
const authController= require('../controllers/user/auth.Controller')
const {userAuth,adminAuth} = require('../middlewares/auth')

router.get('/test',userController.test)
router.get('/pageNotFound',userController.pageNotFound);

router.get('/',userController.loadHomepage);
router.get('/products',userAuth,userController.loadProducts);
router.get('/product/:id',userAuth,userController.loadProductDetails);

//Authentication Controller Routes
router.get('/signup',authController.loadSignup);
router.post('/signup',authController.signup)
router.get('/verify-otp', authController.loadVerifyOtp);
router.post('/verify-otp',authController.verifyOtp);
router.get('/resend-otp', authController.resendOtp);
router.get('/auth/google', passport.authenticate('google',{scope:['profile','email']}));
router.get('/auth/google/callback',passport.authenticate('google', { failureRedirect: '/signin' }), 
  (req, res) => {if (req.user) {req.session.user = req.user._id.toString();}res.redirect('/'); })
router.get('/signin', authController.loadSignin);
router.post('/signin', authController.signin);
router.get('/forgot-password',authController.loadForgotPassword);
router.post('/forgot-password', authController.sendResetOtp);
router.get('/reset-password', authController.loadResetPassword);
router.post('/reset-password',authController.resetPassword);
router.get('/logout',authController.logout);

module.exports = router;
