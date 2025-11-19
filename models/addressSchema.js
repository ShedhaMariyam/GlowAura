const mongoose = require ("mongoose");
const {Schema} = mongoose;


const addressSchema = new Schema ({
    userId : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    address : [{
        addressType : {
               type : String,
                required : true
        },
        fullname: {
            type : String,
            required : true
        },
        phone : {
            type :String,
            required : true
        },
        address_line : {
        type :String,
        required : true,
        },
        city : {
            type : String,
            require : true,
        },
        state : {
            type : String,
            require : true,
        },
        pin_code : {
            type : Number,
            require : true,
        },
        country : {
            type : String,
            require : true,
        },
        landmark : {
            type : String,
            require : true,
        },
        is_default : {

            type : Boolean,

        }
     }]
})


const Address = mongoose.model("Address",addressSchema);


module.exports = Address;