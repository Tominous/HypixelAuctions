const config = require('./config');
const HypixelAPI = require('./hypixel/index');
const Hypixel = new HypixelAPI(config.token);
const Database = require('./storage/Mongo');
const { getItemData } = require('./items');
const minecraftItems = require('minecraft-items');
const db = new Database();

let pages = 0;
let loop;

const auctionsMap = new Map();
const itemsMap = new Map();
const auctionEndQueue = new Map();
const priceUpdateQueue = new Map();

const saveAllOpenAuctions = async (page = 0) => {
    const hypixelData = await Hypixel.getAuctions(page);

    pages = hypixelData.totalPages - 1;
    if (hypixelData.success) hypixelData.auctions.map(a => auctionsMap.set(a.uuid, a));
};

const getItem = async item_name => {
    const data = itemsMap.get(item_name);
    const decodedData = await getItemData(data.item_bytes);
    if (!decodedData) return;

    const itemPicture = minecraftItems.get(decodedData.id.value);
    if (!itemPicture) return;

    return itemPicture.icon;
};

const updateItem = async (data, price, auction, quantity) => {
    const dbItem = await db.item.findOne({ name: data.item_name });

    if (!dbItem) return new db.item({ name: data.item_name, pastPrices: [], tier: data.tier, category: data.category, picture: await getItem(data.item_name) }).save();

    const alreadyInserted = dbItem.pastPrices.filter(p => p.auction === auction)[0];

    if (!alreadyInserted) {
        db.item.findOneAndUpdate({ name: data.item_name }, { $push: { pastPrices: { price, date: Date.now(), auction, quantity: quantity.Count.value } } }, (err, res) => {
            console.log("Update Queue: " + priceUpdateQueue.size);
        });
    };
};

const checkEnd = () => {
    const time = Date.now();

    auctionsMap.forEach(async a => {
        if (a.end <= time) {
            auctionsMap.delete(a.uuid);

            if (!auctionEndQueue.get(a.uuid)) {
                const auctionEnd = await db.auction.findById(a.uuid);
                if (auctionEnd) return;

                auctionEndQueue.set(a.uuid, a);
                priceUpdateQueue.set(a.uuid, a);
                new db.auction({
                    _id: a.uuid, auctioneer: a.auctioneer, coop: a.coop, start: a.start,
                    end: a.end, name: a.item_name, lore: a.item_lore, extra: a.extra, category: a.category,
                    tier: a.tier, startBid: a.starting_bid, itemBytes: a.item_bytes,
                    highestBid: a.highest_bid_amount, bidders: a.bids
                }).save();

                if (a.highest_bid_amount != 0) updateItem(itemsMap.get(a.item_name), a.highest_bid_amount, a.uuid, await getItemData(a.item_bytes));
            };
        };
    });
};

db.auction.on('save', (doc) => {
    console.log("Insert Queue: " + auctionEndQueue.size);
    auctionEndQueue.delete(doc._id);
});

const startLoop = () => {
    loop = setInterval(() => {
        for (let i = 0; i <= pages; i++) {
            saveAllOpenAuctions(i);
            auctionsMap.forEach(i => itemsMap.set(i.item_name, { item_name: i.item_name, item_bytes: i.item_bytes, tier: i.tier, category: i.category }));
        };
        checkEnd();
    }, 10000);
};

const stopLoop = () => {
    clearInterval(loop);
};

const itemData = async id => {
    const itemData = await db.item.findById(id);

    const amountCirculating = auctionsMap.filter(a => a.item_name === itemData.item_name).length;
    const sold = itemData.pastPrices;

    return { amountCirculating, sold };
};

const auctionData = async id => {
    const auction = auctionsMap.filter(a => a.uuid === id)[0];
    if (!auction) return false;

    const item = await db.item.findOne({ name: auction.item_name });
    if (!item) return false;

    return { auction, item };
};

const allAuctionsData = async () => {
    return auctionsMap;
};

module.exports = { startLoop, stopLoop, itemData, auctionData, allAuctionsData };