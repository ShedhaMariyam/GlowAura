const mongoose = require ('mongoose');
const {Schema} = mongoose;

const categorySchema = new Schema ({
    
    name : {
        type : String,
        required : true,
        unique : true
    },
    description : {
        type : String,
        required : true,
    },
    image : {
        type : String,
        required : true,
    },
    is_active :{
        type : Boolean,
        required : true,
    }
   
})

const Category = mongoose.model("Category",categorySchema)

module.exports =Category;