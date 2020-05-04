const mongoose = require('mongoose');
const url = `mongodb://localhost:27017/scii2`;


mongoose.connect(url)
.then(db => console.log('DB conectada'))
.catch(err => console.error(err))
      //
module.exports = mongoose;