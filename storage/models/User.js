const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({_id: String, password: String, island: String, watchingAuctions: Array, watchingItems: Array, pushNotifications: Boolean});

module.exports = mongoose.model('users', UserSchema);