import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    productName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    images: {
      type: [String],
      required: true
    },
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    variants: [
      {
        size: {
          type: String,
          required: true
        },
        sku_code: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        regular_price: {
          type: Number,
          required: true
        },
        sale_price: {
          type: Number,
          required: true
        }
      }
    ],
    status: {
      type: String,
      enum: ["Listed", "Unlisted"],
      default: "Listed"
    },
    featured: {
      type: Boolean,
      default: false
    },
    is_deleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
