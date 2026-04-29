const mongoose = require("mongoose") ;

const pressingRequestSchema = new mongoose.Schema ({

    user_id:{type:mongoose.Schema.Types.ObjectId,ref:'user' , required : true} ,

    olive_quantity_kg:{type: Number, required: true},

    oil_quality:{type: String,enum:['extra_virgin', 'virgin', 'third_quality'],required: true,} ,

    yield:{liters_per_kg: {type: Number, required: true } , produced_oil_liters: { type: Number, required: true },} ,

    payment:{ type: { type: String, enum: ['money', 'olives'], required: true },pressing_price_per_kg: { type: Number },percentage_taken: { type: Number },} ,

    status:{type: String,enum: ['pending', 'accepted', 'rejected', 'completed'],default: 'pending',},

    appointment_date:{type:Date} ,

    owner_notes:{type : String , default:""},

    is_archived:{type:Boolean , default:false},
    },
    {timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('pressingRequest',pressingRequestSchema) ;
