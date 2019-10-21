const Auctions = require('./routes/Auctions');
const Items = require('./routes/Item');
const express = require('express');
const app = express();

const { startLoop, itemData, auctionData, allAuctionsData } = require('./jobs');

app.use('/api', Auctions);
app.use('/api', Items);

app.listen(5000);

startLoop();

module.exports = { itemData, auctionData, allAuctionsData };