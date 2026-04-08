const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing connection to:', process.env.MONGO_URL);

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('SUCCESS');
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILURE:', err);
    process.exit(1);
  });
