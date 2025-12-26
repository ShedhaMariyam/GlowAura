const express = require ('express')
const router = express.Router();
const passport= require ('passport')
const userController = require('../controllers/user/userController');
const {userAuth,adminAuth} = require('../middlewares/auth')


router.get('/pageNotFound',userController.pageNotFound);

router.get('/',userController.loadHomepage);


router.get('/products',userAuth,userController.loadProducts);
router.get('/product/:id',userAuth,userController.loadProductDetails);


router.get('/signup',userController.loadSignup);
router.post('/signup',userController.signup)
router.get('/verify-otp', userController.loadVerifyOtp);
router.post('/verify-otp',userController.verifyOtp);
router.get('/resend-otp', userController.resendOtp);
router.get('/auth/google', passport.authenticate('google',{scope:['profile','email']}));
router.get('/auth/google/callback',passport.authenticate('google', { failureRedirect: '/signin' }), 
  (req, res) => {if (req.user) {req.session.user = req.user._id.toString();}res.redirect('/'); })
router.get('/signin', userController.loadSignin);
router.post('/signin', userController.signin);
router.get('/forgot-password', userController.loadForgotPassword);
router.post('/forgot-password', userController.sendResetOtp);
router.get('/reset-password', userController.loadResetPassword);
router.post('/reset-password', userController.resetPassword);



router.get('/logout',userController.logout);
module.exports = router;