import bcrypt from "bcrypt";
import User from "../../models/userSchema.js";
import Otp from "../../models/otpSchema.js";
import { securePassword } from "../../utils/password.util.js";



// Check existing user
export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findUserById = async (id)=>{
  return await User.findById(id);
}

// Save or update OTP
export const saveOtp = async (email, otp) => {
  return await Otp.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true, new: true }
  );
};

 //  Find OTP record for email
 export const verifyOtpRecord = async (email, otp) => {
    console.log("verfying email:",email);
    let otpRecord = await Otp.findOne({ email });
    
    if (!otpRecord) {
      return { success: false, message: "OTP expired or not found" }; }

    if(Date.now() - otpRecord.createdAt.getTime() > 60 * 1000){
      await Otp.deleteOne({ email });
      return { success: false, message: "OTP Expired. Please request a new one" };}

    otpRecord = otpRecord.otp.toString().trim();
    otp = otp.toString().trim();

    if (otpRecord !== otp) {
      return { success: false, message: "Invalid OTP. Please try again." };}

    return { success: true };
 };


 // Delete OTP
export const deleteOtp = async (email) => {
  await Otp.deleteOne({ email });
};

 //Create User

export const createUser = async ({ name, email, phone, password }) => {

    const hash = await securePassword(password);
    const newUser = new User({
    name,
    email,
    phone,
    password: hash,
  });

  await newUser.save();
  await Otp.deleteOne({ email });

  return newUser;
};

export const updateEmail = async (id, newEmail) => {
  console.log("updating user id:", id);
  console.log("updating email:", newEmail);
  
  const result = await User.updateOne(
    { _id: id },
    { $set: { email: newEmail } }
  );
  
  return result;
}





// Validate signin
export const validateSignin = async (email, password) => {
  const user = await User.findOne({ email, is_admin: false });
  if (!user) return null;

  if (user.is_Blocked) return "BLOCKED";

  const match = await bcrypt.compare(password, user.password); //checking password match
  if (!match) return null;

  user.lastLogin = new Date();
  await user.save();

  return user;
};

//reset password
export const newPassword = async (email,password)=>{
    const hashedPassword = await securePassword(password);
    await User.updateOne({ email }, { $set: { password: hashedPassword } });
    await Otp.deleteOne({ email });
}