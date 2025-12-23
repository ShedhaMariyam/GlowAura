const mongoose = require('mongoose');
const {Schema} = mongoose;


const reviewSchema = new Schema ({
    userId: {
        type : Schema.Types.ObjectId,
        ref :"User",
        required : true
    },
    productId : {
        type : Schema.Types.ObjectId,
        ref : "Product",
        required : true
        },
    rating :{
        type : Number,

    },
    comment :{
        type : String,

    }

},{ timestamps: true })