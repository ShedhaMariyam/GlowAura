import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

import User from "../../models/userSchema.js";
import Otp from "../../models/otpSchema.js";
import HTTP_STATUS from "../../helpers/httpStatus.js";

const saltround = 10;


// Signup Page
const loadSignup = async (req, res) => {
  try {
    return res.render('signup');
  } catch (error) {
    console.log("Signup page not loading", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Server Error');
  }
};


// Generate OTP
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Send OTP Email
async function sendVerificationEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: `"GlowAura Support" <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: "GlowAura Email Verification Code",
      replyTo: "support@glowaura.com",
      headers: {
        "X-Mailer": "GlowAuraMailer",
        "X-Priority": "3"
      },
      text: `Your GlowAura OTP is: ${otp}. It expires in 1 minute.`,
      html: htmlContent(otp)
    });

    return info.accepted?.length > 0;

  } catch (error) {
    console.error("Error sending email", error);
    return false;
  }
}

function htmlContent(otp) {
  return `
    <div style="max-width:460px;margin:32px auto;font-family:'Inter','Segoe UI',sans-serif;background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.10);padding:32px;border:1px solid #eee;">
      <div style="text-align:center;">
        <h1 style="color:#2b2b2b;margin-bottom:6px;">GlowAura</h1>
        <div style="color:#4b5563;font-size:16px;margin-bottom:20px;">Your trusted online shopping partner</div>
        <h2 style="font-size:20px;font-weight:600;margin-bottom:12px;color:#2b2b2b;">Email Verification</h2>
        <div style="font-size:16px;color:#e9bba2;margin-bottom:18px;">
          Use the OTP below to verify your email.
        </div>
        <div style="display:inline-block;padding:20px 46px;background:#232d3b;border-radius:7px;font-size:32px;font-weight:700;letter-spacing:2px;color:#fff;margin-bottom:16px">
          ${otp}
        </div>
        <div style="font-size:15px;margin:14px 0 20px 0;color:#5a5a5a;">
          This code expires in <strong>1 minute</strong>. Don’t share it.
        </div>
        <hr style="margin:24px 0; border: none; border-top: 1px solid #eaeaea;">
        <div style="font-size:13px;color:#7a7a7a;">
          If you didn’t request this, ignore this email.<br>
          &copy; 2025 GlowAura. All rights reserved.
        </div>
      </div>
    </div>
  `;
}

// Hash Password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, saltround);
    return passwordHash;
  } catch (error) {
    console.error("Error hashing password:", error);
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(HTTP_STATUS.BAD_REQUEST).render("signup", { message: 'User with this email already exists' });
    }

    const otp = generateOtp();
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      return res.json("email-error");
    }

    //  Save OTP in OTP collection (replace any existing one)
    await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

   
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
    const { email, name, phone, password } = req.session.userData || {};

    if (!email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Session expired. Please sign up again." });
    }

    //  Find OTP record for email
    let otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "OTP expired or not found" });
    }

    if(Date.now() - otpRecord.createdAt.getTime() > 60 * 1000){
      await Otp.deleteOne({ email });
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "OTP Expired. Please request a new one" });
    }

    

    otpRecord = otpRecord.otp.toString().trim();
    otp = otp.toString().trim();


    if (otpRecord !== otp) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Invalid OTP. Please try again." });
    }

    
    //  If OTP matches, register the user
    const passwordHash = await securePassword(password);
    const newUser = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });

    await newUser.save();

    await Otp.deleteOne({ email });

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

    // Update OTP collection
    await Otp.findOneAndUpdate(
      { email },
      { otp: newOtp, createdAt: new Date() },
      { upsert: true, new: true }
    );

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

    let findUser = await User.findOne({ email, is_admin:false});
   
    
    if (!findUser) {
      return res.render('signin', { message: 'Invalid email or password' });
    }
    
    // if user blocked
    if(findUser.is_Blocked){
      return res.render('signin',{message :'User is blocked by admin'});
    }
    
    //Checking password
    const passwordMatch = await bcrypt.compare(password, findUser.password);

   

    if (!passwordMatch) {
      return res.render('signin', { message: 'Invalid email or password' });
    }
    findUser.lastLogin = new Date();
    await findUser.save();
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
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('forgot-password', { message: 'No account found with this email.' });
    }

    const otp = generateOtp();
    const emailSent = await sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.render('forgot-password', { message: 'Failed to send email. Try again later.' });
    }

    // Save OTP temporarily
    await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

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

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.render('reset-password', { message: 'Invalid or expired OTP.' });
    }

    if (password !== confirmpassword) {
      return res.render('reset-password', { message: 'Passwords do not match.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltround);
    await User.updateOne({ email }, { $set: { password: hashedPassword } });
    await Otp.deleteOne({ email });

    req.session.resetEmail = null;
    res.render('signin', { message: 'Password reset successful! Please log in.' });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.render('reset-password', { message: 'Something went wrong. Please try again.' });
  }
}



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
    console.log("Logout Error",err);
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
