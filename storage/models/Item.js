const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({ item_name: String, item_bytes: String, item_lore: String, picture: String, tier: String, category: String, itemId: Number, pastPrices: Array });

module.exports = mongoose.model('items', ItemSchema);