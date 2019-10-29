const Hypixel = require('./Hypixel');
const config = require('../config');
const { EventEmitter } = require('events');
const hypixelApi = new Hypixel(config.auctionToken);
let auctionPages = 0;

const auctionList = new Map();
const emitter = new EventEmitter();

const processAuctions = (data) => {
    data.auctions.map(a => {
        if (a.end <= Date.now()) {
            auctionList.delete(a.uuid);
        } else {
            auctionList.set(a.uuid, a);
        };
    });
};

const fetchAuctions = async () => {
    for (let i = 0; i <= auctionPages; i++) {
        const auctionPage = await hypixelApi.getAuctions(i);
        if (!auctionPage.success) continue;

        auctionPages = auctionPage.totalPages;

        emitter.emit('auctionPage', auctionPage);

        processAuctions(auctionPage);
    };
};

setInterval(() => fetchAuctions(), 20000);

module.exports = { emitter, auctionList };