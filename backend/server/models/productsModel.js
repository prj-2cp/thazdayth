const mongoose = require('mongoose') ;

const productSchema = new mongoose.Schema({
    name:{type:String , required : true } ,
    category:{type : String , enum : ['extra_virgin','virgin','third_quality'],required : true },
    price_per_liter:{type : Number ,required : true } ,
    stock_liters:{type :Number , default : 0 } ,
    is_available:{type :Boolean , default : true  } ,
},
{timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports= mongoose.model('product',productSchema) ;