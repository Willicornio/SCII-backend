const md5 = require('md5');
const mongoose = require('mongoose');
const { Schema } = mongoose;


const userSchema = new Schema({
id: { type: String, required: true },
name: { type: String, required: true },
pass: { type: String }
});

module.exports = mongoose.model('User', userSchema); 