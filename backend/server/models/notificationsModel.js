const mongoose = require("mongoose") ;

const notificationSchema = new mongoose.Schema ({
    user_id:{type : mongoose.Schema.Types.ObjectId,ref:'user' , required : true } ,
    order_id:{type:mongoose.Schema.Types.ObjectId, ref : 'order'},
    title : {type:String ,required : true } ,
    message :{type:String , required : true } ,
    is_read:{type:Boolean , default : false} ,
},
{timestamps : { createdAt: 'created_at', updatedAt: 'updated_at' } } ,
);

module.exports = mongoose.model('notification' , notificationSchema) ;