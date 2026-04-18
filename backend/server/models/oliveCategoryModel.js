const mongoose= require("mongoose");
const oliveCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    price_per_liter: { type: Number, required: true },
    stock_liters: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
}, {
    timestamps: true ,
});
module.exports= mongoose.default.model('OliveCategory', oliveCategorySchema);
