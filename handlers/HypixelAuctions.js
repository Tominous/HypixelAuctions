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

        setInterval(() => this.checkAuctions(), 1000);
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

    get allItems() {
        return this.auctions.forEach(a => a.getItem());
    }

    checkAuctions() {
        this.auctions.forEach(a => {
            const isEnded = a.checkEnded();
            if (!isEnded) return;

            new this.db.auction({_id: a.uuid, auctioneer: a.auctioneer, coop: a.coop, start: a.start, end: a.end, item_name: a.item_name, item_lore: a.item_lore, extra: a.extra, category: a.category, tier: a.tier, starting_bid: a.starting_bid, item_bytes: a.item_bytes, highest_bid_amount: a.highest_bid_amount, bids: a.bids});
        });
    }
}

module.exports = HypixelAuctions;