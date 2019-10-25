const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuctionSchema = new Schema({_id: String, auctioneer: String, coop: Array, start: Number, end: Number, name: String, lore: String, extra: String, 
category: String, tier: String, startBid: Number, itemBytes: String, highestBid: Number, bidders: Array});

module.exports = mongoose.model('auctions', AuctionSchema);