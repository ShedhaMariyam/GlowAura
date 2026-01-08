import User from "../../models/userSchema.js";
import bcrypt from "bcrypt";

export const authenticateAdmin = async (email, password) => {
     const admin = await User.findOne({ email, is_admin: true });

  if (!admin) {
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, admin.password);

  if (!passwordMatch) {
    return null;
  }
  return admin;
};