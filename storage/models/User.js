const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({_id: String, island: String, watchingAuctions: Array});

module.exports = mongoose.model('users', UserSchema);