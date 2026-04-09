const mongoose = require('mongoose') ;

const availabilitySchema = new mongoose.Schema({
    date:{type:Date ,required :true ,unique : true , index : true } ,
    is_blocked : {type : Booleen , default : true } ,
},

{timestamps:true ,}
) ;

module.exports = mongoose.model ('availability',availabilitySchema) ;