const mongoose = require ("mongoose")

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    address: { type: String, trim: true },
    role: { type: String, enum: ['customer', 'owner'], default: 'customer' },
    is_subscribed: { type: Boolean, default: false },
    is_blacklisted: { type: Boolean, default: false },//we add an black list in the front
    
    //those we need them when i do the auth/forget_password route 
    //that why i added them
    reset_password_code: { type: String },
    reset_password_expires: { type: Date },
}, 
{timestamps:true ,});
module.exports = mongoose.model('user' , userSchema) ;