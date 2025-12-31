import express from "express";
import passport from "passport";

const router = express.Router();

//controllers
import * as userController from "../controllers/user/userController.js";
import * as authController from "../controllers/user/authController.js";

//middlewares
import { userAuth, adminAuth } from "../middlewares/auth.js";


router.get("/test", userController.test);
router.get("/pageNotFound", userController.pageNotFound);

router.get("/", userController.loadHomepage);
router.get("/products", userAuth, userController.loadProducts);
router.get("/product/:id", userAuth, userController.loadProductDetails);

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
