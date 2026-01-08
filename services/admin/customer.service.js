import User from "../../models/userSchema.js";

// customer info
export const getCustomers = async ({ search, page, limit }) => {
  const query = {
    is_admin: false,
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ]
  };

  const users = await User.find(query)
    .sort({ createdOn: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const count = await User.countDocuments(query);

  return { users, count };
};

// block/unblock
export const updateUserBlockStatus = async (id, status) => {
  await User.updateOne(
    { _id: id },
    { $set: { is_Blocked: status } }
  );
};
