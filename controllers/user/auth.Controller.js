
import HTTP_STATUS from "../../helpers/httpStatus.js";
import * as authService from "../../services/user/auth.service.js";
import { generateOtp } from "../../utils/otp.util.js";
import { sendVerificationEmail } from "../../utils/mail.util.js";


// Signup Page
const loadSignup = async (req, res) => {
  try {
    return res.render('signup');
  } catch (error) {
    console.log("Signup page not loading", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Server Error');
  }
};

// Signup Function
const signup = async (req, res) => {
  try {
    const { name, email, phone, password, confirmpassword } = req.body;
    
    if (!name || !email || !password || !phone || !confirmpassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).render("signup", { message: 'All fields are required' });
    }
    console.log(phone);
    
    if (password !== confirmpassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).render("signup", { message: 'Passwords do not match' });
    }

    // Check if user already exists
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(HTTP_STATUS.BAD_REQUEST).render("signup", { message: 'User with this email already exists' });
    }

    const otp = generateOtp();
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      return res.json("email-error");
    }

    await authService.saveOtp(email, otp);
   
    req.session.userData = { name, email, password,phone};

    res.status(HTTP_STATUS.OK).json({ success: true, redirectUrl:'/verify-otp' });
    console.log("OTP sent to:", email, "=>", otp);
  } catch (error) {
    console.error("Signup error:", error);
    return res.redirect("/pageNotFound");
  }
};

//load otp page
const loadVerifyOtp = async (req, res) => {
  try {
    res.render('verify-otp', { message: null });
  } catch (error) {
    console.error("Error loading verify-otp page:", error);
    res.redirect('/pageNotFound');
  }
};

// Verify OTP Function
const verifyOtp = async (req, res) => {
  try {
    let { otp } = req.body;
    console.log("User entered otp :",otp)
    
    const { email, name, phone, password } = req.session.userData || {};

    console.log("Email for verification: ",email);
    if (!email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Session expired. Please sign up again." });
    }

    const result = await authService.verifyOtpRecord(email, otp);
    if (!result.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: result.message });
    }
   
    await authService.createUser({ name, email, phone, password });

    // Clear session and set login
    req.session.userData = null;

    res.json({ success: true, redirectUrl: "/signin" });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: "An error occurred" });
  }
};

//  Resend OTP 
const resendOtp = async (req, res) => {
  try {
    const { email } = req.session.userData || {};

    if (!email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Session expired. Please sign up again." });
    }

    const newOtp = generateOtp();
    const emailSent = await sendVerificationEmail(email, newOtp);

    if (!emailSent) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Failed to send OTP email." });
    }

    await authService.saveOtp(email, newOtp);

    console.log("Resent OTP to:", email, "=>", newOtp);
    res.json({ message: "A new verification code has been sent to your email." });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong. Please try again." });
  }
};

//load Signin Page

const loadSignin = async (req, res) => {
  try {
    if(!req.session.user){
      return res.render('signin', { message: null });
    }
    else{
      res.redirect ('/')
    }
    
  } catch (error) {
    console.error("Signin page not loading:", error);
    res.redirect('/pageNotFound');
  }
};


const signin = async (req, res) => {
  try {
     
    const { email, password } = req.body;
    console.log(email,password);
    let findUser = await authService.validateSignin(email, password);
   
    if (!findUser) {
      return res.render('signin', { message: 'Invalid email or password' });
    }
    // if user blocked
    if(findUser === "BLOCKED"){
      return res.render('signin',{message :'User is blocked by admin'});
    }

    req.session.user = findUser._id;
    res.redirect('/');
  } catch (error) {
    console.error("Signin error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render('signin', { message: 'Something went wrong. Please try again later.' });
  }
};

//load Forgot password Page
const loadForgotPassword = async (req, res) => {
  try {
    res.render('forgot-password', { message: null });
  } catch (error) {
    console.error("Error loading forgot password page:", error);
    res.redirect('/pageNotFound');
  }
};

const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = authService.findUserByEmail(email);

    if (!user) {
      return res.render('forgot-password', { message: 'No account found with this email.' });
    }

    const otp = generateOtp();
    const emailSent = await sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.render('forgot-password', { message: 'Failed to send email. Try again later.' });
    }

    // Save OTP temporarily
   await authService.saveOtp(email, otp);

    // Store email in session
    req.session.resetEmail = email;

    res.render('verify-otp', { email, message: null });
    console.log(" Password reset OTP sent:", email, "=>", otp);
  } catch (error) {
    console.error("Error sending reset OTP:", error);
    res.render('forgot-password', { message: 'Something went wrong. Please try again.' });
  }
};

//  Verify OTP & Load Reset Password Page
const loadResetPassword = async (req, res) => {
  try {
    res.render('reset-password', { message: null });
  } catch (error) {
    console.error("Error loading reset page:", error);
    res.redirect('/pageNotFound');
  }
};

//  Handle Reset Password Submission
const resetPassword = async (req, res) => {
  try {
    const { otp, password, confirmpassword } = req.body;
    const email = req.session.resetEmail;

    if (!email) {
      return res.render('forgot-password', { message: 'Session expired. Try again.' });
    }

    const result = await authService.verifyOtpRecord(email, otp);
    if (!result.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: result.message });
    }
    
    if (password !== confirmpassword) {
      return res.render('reset-password', { message: 'Passwords mismatch!!.' });
    }

    await authService.newPassword(email,password)

    req.session.resetEmail = null;
    res.render('signin', { message: 'Password reset successful! Please log in.' });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.render('reset-password', { message: 'Something went wrong. Please try again.' });
  }
}

//logout
const logout = async(req,res)=>{
  try {

      req.session.destroy((err)=>{
        if(err){
          console.log("Session not destroyed");
          return res.redirect('/pageNotFound');
        }
        return res.redirect('/signin');
      })
    
  } catch (error) {
    console.log("Logout Error",error);
    res.redirect('/pageNotFound');
    
  }
}

export {
  loadSignup,
  signup,
  loadVerifyOtp,
  verifyOtp,
  resendOtp,
  loadSignin,
  signin,
  loadForgotPassword,
  sendResetOtp,
  loadResetPassword,
  resetPassword,
  logout
};
