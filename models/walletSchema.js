import mongoose from "mongoose";

const { Schema } = mongoose;

const walletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    balance: {
      type: Number,
      default: 0
    },
    transactions: [
      {
        date: {
          type: Date,
          required: true
        },
        description: {
          type: String,
          required: true
        },
        amount: {
          type: Number,
          required: true
        }
      }
    ]
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
