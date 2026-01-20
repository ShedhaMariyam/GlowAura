import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: false,
    unique: false,
    sparse: true,
    default: null
  },
  profileImage :{
    type: String,
    
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: false,
    minlength: 6
  },
  lastLogin: {
    type: Date
  },
  is_Blocked: {
    type: Boolean,
    default: false
  },
  is_admin: {
    type: Boolean,
    default: false
  },
  is_referred: {
    type: Boolean,
    default: false
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  cart: [
    {
      type: Schema.Types.ObjectId,
      ref: "Cart"
    }
  ],
  wallet: [
    {
      type: Schema.Types.ObjectId,
      ref: "Wallet"
    }
  ],
  wishlist: [
    {
      type: Schema.Types.ObjectId,
      ref: "Wishlist"
    }
  ],
  orderHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order"
    }
  ],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Reviews"
    }
  ],
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Messages"
    }
  ],
  redeemedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  searchHistory: [
    {
      category: {
        type: Schema.Types.ObjectId,
        ref: "Category"
      },
      searchOn: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdOn: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);

export default User;
