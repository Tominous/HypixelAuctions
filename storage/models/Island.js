const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IslandSchema = new Schema({ _id: String, members: Object });

module.exports = mongoose.model('islands', IslandSchema);