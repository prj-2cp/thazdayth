const mongoose = require("mongoose");
const oilQualitySettingSchema = new mongoose.Schema({
    quality_name: {type: String,enum: ['extra_virgin', 'virgin', 'third_quality'],required: true,unique: true,},

    liters_per_kg: { type: Number, required: true },

    price_per_liter: { type: Number, required: true },

    processing_price_per_kg: { type: Number, required: true },

});
module.exports = mongoose.model('OilQualitySetting', oilQualitySettingSchema);
