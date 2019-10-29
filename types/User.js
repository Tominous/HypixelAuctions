class User {
    constructor(id, data, ws, db) {
        this.id = id;
        this.user = data;
        this.db = db;

        this.watchingAuctions = ["851d734de600469eac2abb7e38cbd8da", "b6dc2e67a94e4648a7855c45454b4995"];
        this.watchingItems = ["Spicy Aspect of the End Diamond Sword"];
        this.ws = ws;

        this.ws.onmessage = msg => this.handleMessage(msg);

        this.AUCTION_CREATED = 5;
        this.AUCTION_UPDATED = 6;
        this.USER_DATA = 8;
    }

    parseMessage(msg) {
        try {
            return JSON.parse(msg);
        } catch (e) {
            return {};
        }
    }

    async handleMessage(msg) {
        const data = this.parseMessage(msg.data);

        switch (data.op) {
            case this.USER_DATA:
                let userData = await this.db.user.findById(this.user._id);
                userData.password = undefined;

                this.sendMessage(this.USER_DATA, userData);
                break;
        }
    }

    handleAuctionCreated(id, auction) {
        if (!this.watchingItems.includes(auction.item_name)) return;

        this.sendMessage(this.AUCTION_CREATED, auction);
    }

    handleAuctionUpdate(id, auction) {
        if (!this.watchingAuctions.includes(id)) return;

        this.sendMessage(this.AUCTION_UPDATED, auction);
    }

    sendMessage(op, msg) {
        this.ws.send(JSON.stringify({ op, data: msg }));
    }
}

module.exports = User;