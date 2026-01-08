import bcrypt from "bcrypt";
const saltround=10;

export const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, saltround);
    return passwordHash;
  } catch (error) {
    console.error("Error hashing password:", error);
  }
};