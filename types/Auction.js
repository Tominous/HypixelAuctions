const { EventEmitter } = require('events');
const Item = require('./Item');

class Auction extends EventEmitter {
    constructor(auction) {
        super();

        this.id = auction.uuid;
        this.auction = auction;
        this.bids = this.auction.bids;
        this.highestBid = this.auction.highest_bid_amount;
        this.item = new Item(this.auction.item_name, this.auction.item_bytes);

        
        this.setBids = bidders => {
            this.bids = bidders;

            this.emit('auctionUpdateBids', this.id, bidders);
        };

        this.setHighestBid = amount => {
            this.highestBid = amount;

            this.emit('auctionUpdateAmount', this.id, amount);
        };
    }

    get item_bytes() {
        return this.auction.item_bytes;
    }

    get item_name() {
        return this.auction.item_name;
    }

    get coop() {
        return this.auction.coop;
    }

    get auctioneer() {
        return this.auction.auctioneer;
    }

    get lore() {
        return this.auction.item_lore;
    }

    get startingBid() {
        return this.auction.starting_bid;
    }
    
    get tier() {
        return this.auction.tier;
    }

    get category() {
        return this.auction.category;
    }

    get start() {
        return this.auction.start;
    }

    get end() {
        return this.auction.end;
    }

    checkEnded() {
        const time = Date.now();

        return time >= this.auction.end;
    }
}

module.exports = Auction;