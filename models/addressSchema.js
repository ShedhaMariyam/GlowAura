import mongoose from "mongoose";

const { Schema } = mongoose;

const addressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  address: [
    {
      addressType: {
        type: String,
        required: true
      },
      fullname: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      address_line: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      pin_code: {
        type: Number,
        required: true
      },
      country: {
        type: String,
        required: true
      },
      landmark: {
        type: String,
        required: true
      },
      is_default: {
        type: Boolean,
        default: false
      }
    }
  ]
});

const Address = mongoose.model("Address", addressSchema);

export default Address;
