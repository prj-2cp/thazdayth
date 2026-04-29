const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user_id:{type:mongoose.Schema.Types.ObjectId,ref : 'user' , required:true} ,
    content:{type:String , required : true },
    rating:{type:Number , required:true , min:1 , max : 5 , default : 5 },
},
{timestamps : { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports= mongoose.model('comment' , commentSchema) ;