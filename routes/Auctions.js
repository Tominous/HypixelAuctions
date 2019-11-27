const router = require('express').Router();
const Database = require('../storage/Mongo');
const { auctionList } = require('../handlers/AuctionCache');
const db = new Database();
const io = require('@pm2/io');
const counter = io.counter({ name: "Auctions Route Active Handles" });

router.get('/auctions', async (req, res) => {
    counter.inc();
    req.on('end', () => counter.dec());

    const auctions = auctionList;
    let filters;
    try {
        filters = JSON.parse(decodeURI(req.query.filters));
    } catch (e) {
        filters = {};
    }
    const itemsPerPage = req.query.items || 10;
    const pageCount = Math.round(auctions.size / itemsPerPage);
    let page = parseInt(req.query.page || 1);

    const auctionHouse = Array.from(auctions).map(a => ({ ...a[1] }));
    let data = [];

    if (filters.name) data = auctionHouse.filter(i => (i.auction.item_name.toLowerCase()).includes(filters.name.toLowerCase()));
    if (!data.length) data = auctionHouse;
    data = data.map(a => a.auction);

    if (filters.enchants) {
        if (filters.enchants.length) {
            let enchantData = [];
            filters.enchants.map(e => {
                const enchantFilter = auctionHouse.filter(a => a.item.enchantments.includes(e));

                enchantFilter.map(e => enchantData.push(e));
            });

            data = enchantData.map(a => a.auction);
        };
    };

    if (filters.types.length) {
        let typeData = [];
        filters.types.map(f => {
            switch (f) {
                case "weapon":
                    const weaponsFilter = auctionHouse.filter(a => a.auction.category === "weapon");
                    weaponsFilter.map(i => typeData.push(i.auction));
                    break;
                case "armor":
                    const armorFilter = auctionHouse.filter(a => a.auction.category === "armor");
                    armorFilter.map(i => typeData.push(i.auction));
                    break;
                case "accessories":
                    const accessoriesFilter = auctionHouse.filter(a => a.auction.category === "accessories");
                    accessoriesFilter.map(i => typeData.push(i.auction));
                    break;
                case "consumables":
                    const consumablesFilter = auctionHouse.filter(a => a.auction.category === "consumables");
                    consumablesFilter.map(i => typeData.push(i.auction));
                    break;
                case "blocks":
                    const blocksFilter = auctionHouse.filter(a => a.auction.category === "blocks");
                    blocksFilter.map(i => typeData.push(i.auction));
                    break;
                case "misc":
                    const miscFilter = auctionHouse.filter(a => a.auction.category === "misc");
                    miscFilter.map(i => typeData.push(i.auction));
                    break;
            }
        });

        data = typeData;
    }

    if (filters.tiers.length) {
        let tierData = [];
        filters.tiers.map(f => {
            switch (f) {
                case "COMMON":
                    const commonFiltered = data.filter(a => a.auction.tier === "COMMON");
                    commonFiltered.map(i => tierData.push(i.auction));
                    break;
                case "UNCOMMON":
                    const uncommonFiltered = data.filter(a => a.auction.tier === "UNCOMMON");
                    uncommonFiltered.map(i => tierData.push(i.auction));
                    break;
                case "RARE":
                    const rareFiltered = data.filter(a => a.auction.tier === "RARE");
                    rareFiltered.map(i => tierData.push(i.auction));
                    break;
                case "EPIC":
                    const epicFiltered = data.filter(a => a.auction.tier === "EPIC");
                    epicFiltered.map(i => tierData.push(i.auction));
                    break;
                case "LEGENDARY":
                    const legendaryFilter = data.filter(a => a.auction.tier === "LEGENDARY");
                    legendaryFilter.map(i => tierData.push(i.auction));
                    break;
                case "SPECIAL":
                    const specialFilter = data.filter(a => a.auction.tier === "SPECIAL");
                    specialFilter.map(i => tierData.push(i.auction));
                    break;
            }
        });

        data = tierData;
    }

    if (filters.sort.length) {
        filters.sort.map(f => {
            switch (f) {
                case "ENDING_SOON":
                    data.sort((a, b) => a.end - b.end);
                    break;
                case "PRICE_LOW_HIGH":
                    data.sort((a, b) => (a.highest_bid_amount > 0 ? a.highest_bid_amount : a.starting_bid) - (b.highest_bid_amount > 0 ? b.highest_bid_amount : b.starting_bid));
                    break;
                case "PRICE_HIGH_LOW":
                    data.sort((a, b) => (b.highest_bid_amount > 0 ? b.highest_bid_amount : b.starting_bid) - (a.highest_bid_amount > 0 ? a.highest_bid_amount : a.starting_bid));
                    break;
                case "BIDS_HIGH_LOW":
                    data.sort((a, b) => b.bids.length - a.bids.length);
                    break;
            }
        });
    }

    if (page > pageCount) page = 1;
    if (!data) res.json({ success: false });

    res.json({
        success: true,
        page,
        pageCount,
        data: data.slice(page * itemsPerPage - itemsPerPage, page * itemsPerPage)
    });
});

router.get('/auctions/:id', async (req, res) => {
    counter.inc();
    req.on('end', () => counter.dec());

    const auctionId = req.params.id;
    const auction = auctionList.get(auctionId);
    if (!auction) return res.status(404).json({ success: false, message: "No auction found!" });

    res.json({ success: true, data: auction.auction });
});

module.exports = router;