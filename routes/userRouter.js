import express from "express";
import passport from "passport";

const router = express.Router();

//controllers
import * as homeController from "../controllers/user/home.Controller.js";
import * as authController from "../controllers/user/auth.Controller.js";

//middlewares
import { userAuth } from "../middlewares/auth.js";



router.get("/pageNotFound", homeController.pageNotFound);

router.get("/", homeController.loadHomepage);
router.get("/products", userAuth, homeController.loadProducts);
router.get("/product/:id", userAuth, homeController.loadProductDetails);

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
