const mongoose = require("mongoose") ;

const orderSchema = new mongoose.Schema ({
    user_id:{type : mongoose.Schema.Types.ObjectId, ref:'user', required : true } ,
    total:{type : Number , required : true } ,
    delivery_requested:{type:Boolean} ,
    items: [{
            olive_category_id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: 'OliveCategory'
            },
            model_type: {
                type: String,
                required: true,
                enum: ['OliveCategory', 'Product'],
                default: 'OliveCategory'
            },
            pressing_service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PressingService' },
            quantity: { type: Number, required: true },
            olive_price_at_order: { type: Number, required: true },
            pressing_fee_at_order: { type: Number, required: true },
            subtotal: { type: Number, required: true },
    }],
    shipping:{
        type:{type:String , enum:['delivery','pickup'] },
        wilaya:{type:String} ,
        cost:{type:Number , default : 0} ,
        pickup_date:{type : Date} ,
        pickup_rang_start:{type:Date} ,
        pickup_rang_end:{type : Date} ,
        pickup_hours:{type : String} ,
        pickup_status:{type:String,enum:['pending', 'proposed' ,'accepted', 'rejected', 'collected'],default: 'pending'},
    },

    status:{type: String,
    enum: ['pending', 'in-progress', 'completed', 'delivered','cancelled'],default: 'pending',},
    owner_notes:{type:String , default:""},
    is_achived:{type:Boolean , deefault : false},

},
{timestamps : true },
);

module.exports = mongoose.model ('order' , orderSchema) ;