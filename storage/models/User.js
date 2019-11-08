const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({ _id: String, island: String, watchingAuctions: Array, watchingItems: Array, settings: { recieveNotifications: Boolean, apiToken: String, showSellers: Boolean } });

module.exports = mongoose.model('users', UserSchema);