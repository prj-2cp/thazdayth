const mongoose= require("mongoose");

const settingsSchema = new mongoose.Schema({
    pressing_percentage_taken: { type: Number, required: true, default: 30 },
},
{timestamps:true} ,
);

module.exports = mongoose.model('Settings', settingsSchema);
