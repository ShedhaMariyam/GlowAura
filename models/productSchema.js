const mongoose = require ("mongoose");
const {Schema} = mongoose;


const productSchema = new Schema ({
    productName  : {
        type: String,
        required : true,
    },
    description : {
        type : String,
        required : true,
     },
      category : {
        type : Schema.Types.ObjectId,
        ref : "Category",
        required : true
     },
     sale_price : {
        type: Decimal128,
        required : true,
     },
      offer_percentage : {
        type: Number,
        required : true,
        default : 0
     },
     quantity: {
        type : Number,
        required : true,
     },
     images :{
        type: [String],
        required : true,
     },
     varients : [{
        size : {
            type: String,
            enum : ("30 ml","50 ml","100 ml"),
            required : true,
        },
        sku_code : {
            type : String,
            required : true,
        },
        stock : {
            type : Number,
            required : true,
        },
        price : {
            type : Number,
            required : true,
        }

     }],
     is_unlisted : {
        type : Boolean,
        default : false,
     }

},{timestamps : true});

const Product = mongoose.model("Product".productScheam);

module.exports = Product;