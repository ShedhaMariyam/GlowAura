import HTTP_STATUS from "../../constants/httpStatus.js";
import logger from "../../utils/logger.js";
import bcrypt from "bcrypt";
import { findUserByEmail, findUserById, saveOtp, verifyOtpRecord, deleteOtp } from "../../services/user/auth.service.js";
import { sendVerificationEmail } from "../../utils/mail.util.js";
import { generateOtp } from "../../utils/otp.util.js";
import { securePassword } from "../../utils/password.util.js";


const loadProfile = async (req, res, next) => {
  try {
    const userId = req.session.user;
    const userData = await findUserById(userId);
    res.render('userprofile', {
      user: userData,
      activePage: "profile"
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.session.user;
    const { name, phone, email } = req.body;

    const user = await findUserById(userId);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Update name and phone
    user.name = name;
    user.phone = phone;

    // Handle profile image upload
    if (req.file) {
      user.profileImage = req.file.path;
    }

    // Check if email is being changed
    if (email !== user.email) {
      const existingEmail = await findUserByEmail(email);
      if (existingEmail) {
        return res.status(HTTP_STATUS.CONFLICT).json({ 
          success: false, 
          message: "Email already exists" 
        });
      }

      // Generate and send OTP to new email
      const otp = generateOtp();
      await saveOtp(email, otp);
      await sendVerificationEmail(email, otp);

      // Store in session for verification
      req.session.otpPurpose = "email-change";
      req.session.pendingEmail = email;
      req.session.userId = user._id.toString();

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        otpRequired: true,
        message: "OTP sent to new email",
        redirectUrl: "/verify-otp"
      });
    }

    // Save user if no email change
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Profile updated successfully"
    });

  } catch (error) {
    logger.error("Error while updating Profile", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.session.user;
    const { currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Validate new password length
    if (newPassword.length < 8 || newPassword.length > 15) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Password must be 8-15 characters long"
      });
    }

    // Validate password contains letters and numbers
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Password must contain both letters and numbers"
      });
    }

    // Find user
    const user = await findUserById(userId);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "New password cannot be the same as current password"
      });
    }

    // Hash and update password
    const hashedPassword = await securePassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    logger.error("Error changing password:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update password"
    });
  }
};

export {
  loadProfile,
  updateProfile,
  changePassword
};