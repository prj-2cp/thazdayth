const mongoose = require('mongoose');

const shippingRateSchema = new mongoose.Schema(
  {
    wilaya_code: {
      type: Number,
      required: true,
      unique: true,
    },
    wilaya: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {timestamps: true,} /*this will manage when it 
                       created the 1st time and manages 
                       when it is updated*/
);

module.exports = mongoose.model('shippingRate', shippingRateSchema);