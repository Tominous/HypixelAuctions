const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HypixelUserSchema = new Schema({ _id: String, playername: String, displayname: String, islands: Object });

module.exports = mongoose.model('hypixelUsers', HypixelUserSchema);