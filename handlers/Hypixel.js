const fetch = require('node-fetch');

const HYPIXEL_API = "https://api.hypixel.net";
const AUCTIONS_ROUTE = HYPIXEL_API + "/skyblock/auctions";
const AUCTION_ROUTE = HYPIXEL_API + "/skyblock/auction";
const PLAYER_ROUTE = HYPIXEL_API + "/player"; 
const PROFILE_ROUTE = HYPIXEL_API + "/skyblock/profile";

class Hypixel {
    constructor(token) {
        this.token = token;
    }

    async getAuctions(page=0) {
        const url = new URL(AUCTIONS_ROUTE);
        url.searchParams.append('key', this.token);
        url.searchParams.append('page', page);

        const response = await fetch(url);
        const data = await response.json();

        return data; 
    }

    async getUser(uuid) {
        const url = new URL(PLAYER_ROUTE);
        url.searchParams.append('key', this.token);
        url.searchParams.append('uuid', uuid);

        const response = await fetch(url);
        const data = await response.json();

        return data; 
    }   

    async getIsland(uuid) {
        const url = new URL(PROFILE_ROUTE);
        url.searchParams.append('key', this.token);
        url.searchParams.append('profile', uuid);

        const response = await fetch(url);
        const data = await response.json();

        return data;
    }

    async getAuction(uuid) {
        const url = new URL(AUCTION_ROUTE);
        url.searchParams.append('key', this.token);
        url.searchParams.append('uuid', uuid);

        const response = await fetch(url);
        const data = await response.json();

        return data;
    }
}

module.exports = Hypixel;