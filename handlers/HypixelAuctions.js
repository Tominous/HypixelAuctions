const { EventEmitter } = require('events');
const { isEqual } = require('lodash');
const config = require('../config');
const Hypixel = require('./Hypixel');
const Auction = require('../types/Auction');
const Database = require('../storage/Mongo');

class HypixelAuctions extends EventEmitter {
    constructor() {
        super();

        this.loop = null;
        this.interval = 15000;

        this.auctions = new Map();
        this.insertQueue = [];
        this.updateQueue = [];

        this.auctionPages = 0;

        this.hypixelApi = new Hypixel(config.token);
        this.db = new Database();
    }

    init() {
        this.loop = setInterval(() => this.fetchAuctions(), this.interval);
    }

    async processAuction(auctionPage) {
        auctionPage.auctions.map(async a => {
            let auction = this.auctions.get(a.uuid);
            if (!auction) {
                auction = this.auctions.set(a.uuid, new Auction(a));
                this.emit('auctionCreated', a.uuid, a);
            } else {
                if (!isEqual(auction.bids, a.bids)) auction.setBids(a.bids);
                if (auction.highest_bid_amount !== a.highest_bid_amount) auction.setHighestBid(a.highest_bid_amount);

                this.emit('auctionUpdate', a.uuid, a);
            }
        });
    }

    async fetchAuctions() {
        for (let i = 0; i <= this.auctionPages; i++) {
            const auctionPage = await this.hypixelApi.getAuctions(i);
            if (!auctionPage.success) continue;

            this.auctionPages = auctionPage.totalPages;

            this.processAuction(auctionPage);
        };

        this.checkAuctions();
    }

    get allItems() {
        return this.auctions.forEach(a => a.getItem());
    }

    checkAuctions() {
        this.auctions.forEach(a => {
            const isEnded = a.checkEnded();
            if (!isEnded) return;

            new this.db.auction({_id: a.uuid, auctioneer: a.auctioneer, coop: a.coop, start: a.start, end: a.end, name: a.item_name, lore: a.item_lore, extra: a.extra, category: a.category, tier: a.tier, startBid: a.starting_bid, itemBytes: a.item_bytes, highestBid: a.highest_bid_amount, bidders: a.bids});
        });
    }
}

module.exports = HypixelAuctions;