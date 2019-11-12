const { EventEmitter } = require('events');
const { isEqual } = require('lodash');
const config = require('../config');
const Hypixel = require('./Hypixel');
const Auction = require('../types/Auction');
const Database = require('../storage/Mongo');
const { emitter: auctionCache } = require('./AuctionCache');

class HypixelAuctions extends EventEmitter {
    constructor() {
        super();

        this.auctions = new Map();
        this.insertQueue = [];
        this.updateQueue = [];

        this.auctionPages = 0;

        this.hypixelApi = new Hypixel(config.token);
        this.db = new Database();

        auctionCache.on('auctionPage', auctionData => this.processAuction(auctionData));

        setInterval(() => this.checkAuctions(), 2000);
    }

    async processAuction(auctionPage) {
        auctionPage.auctions.map(async a => {
            let auction = this.auctions.get(a.uuid);
            if (!auction) {
                auction = this.auctions.set(a.uuid, new Auction(a));
                this.emit('auctionCreated', a.uuid, a);
            } else {
                if (!isEqual(auction.bids, a.bids)) {
                    auction.setHighestBid(a.highest_bid_amount);
                    auction.setBids(a.bids);

                    this.emit('auctionUpdate', a.uuid, a);
                }
            }
        });
    }

    async updateItem(item, price, lore) {
        let itemData = await this.db.item.findOne({ name: item.getName() });
        if (!itemData) itemData = await new this.db.item({ name: item.getName(), picture: await item.getIcon() || "", item_lore: lore }).save();

        this.db.item.findOneAndUpdate({ name: item.getName() }, { $push: { pastPrices: { date: Date.now(), price, amount: await item.getSize() } }, $set: { item_lore: lore } }, (err, res) => {

        });
    }

    get allItems() {
        return this.auctions.forEach(a => a.getItem());
    }

    checkAuctions() {
        this.auctions.forEach(async a => {
            const isEnded = a.checkEnded();
            if (!isEnded) return;
            this.auctions.delete(a.id);
            if (a.bids.length > 0) this.updateItem(a.item, a.highestBid, a.auction.item_lore);
            return;
        });
    }
}

module.exports = HypixelAuctions;