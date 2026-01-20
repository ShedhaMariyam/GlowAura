import express from "express";
import passport from "passport";

const router = express.Router();

//controllers
import * as homeController from "../controllers/user/shop.controller.js";
import * as authController from "../controllers/user/auth.controller.js";
import * as profileController from "../controllers/user/profile.controller.js";

//middlewares
import { userAuth } from "../middlewares/auth.js";
import upload from "../middlewares/uploadImage.js";


router.get("/profile",userAuth,profileController.loadProfile)
router.post("/profile/update", userAuth,(req, res, next) => {
    req.uploadFolder = "glowaura/userprofile";
    next();
  },upload.single("profileImage"), profileController.updateProfile);
router.post("/profile/change-password", userAuth, profileController.changePassword);

router.get("/pageNotFound", homeController.pageNotFound);

router.get("/", homeController.loadHomepage);
router.get("/products",  homeController.loadProducts);
router.get("/product/:id", homeController.loadProductDetails);

//auth routes
router.get("/signup", authController.loadSignup);
router.post("/signup", authController.signup);

router.get("/verify-otp", authController.loadVerifyOtp);
router.post("/verify-otp", authController.verifyOtp);
router.get("/resend-otp", authController.resendOtp);

//google auth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signin" }),
  (req, res) => {
    if (req.user) {
      req.session.user = req.user._id.toString();
    }
    res.redirect("/");
  }
);

//signin / password
router.get("/signin", authController.loadSignin);
router.post("/signin", authController.signin);

router.get("/forgot-password", authController.loadForgotPassword);
router.post("/forgot-password", authController.sendResetOtp);

router.get("/reset-password", authController.loadResetPassword);
router.post("/reset-password", authController.resetPassword);

router.get("/logout", authController.logout);


export default router;
