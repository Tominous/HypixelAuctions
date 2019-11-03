const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({ username: String, password: String, island: String, watchingAuctions: Array, watchingItems: Array, settings: { pushNotifications: Boolean, apiToken: String } });

module.exports = mongoose.model('users', UserSchema);