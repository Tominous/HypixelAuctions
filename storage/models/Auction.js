const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuctionSchema = new Schema({
    _id: String, auctioneer: String, coop: Array, start: Number, end: Number, item_name: String, item_lore: String, extra: String,
    category: String, tier: String, starting_bid: Number, item_bytes: String, highest_bid_amount: Number, bids: Array
});

module.exports = mongoose.model('auctions', AuctionSchema);