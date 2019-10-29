const router = require('express').Router();
const config = require('../config.json');
const Database = require('../storage/Mongo');
const HypixelAPI = require('../handlers/Hypixel');
const { auctionList } = require('../handlers/AuctionCache');
const Hypixel = new HypixelAPI(config.auctionToken, config.userToken);
const db = new Database();

router.get('/auctions', async (req, res) => {
    const auctions = auctionList;
    const itemsPerPage = req.query.items || 10;
    const pageCount = Math.floor(auctions.size / itemsPerPage);
    let page = parseInt(req.query.page || 1);

    const data = Array.from(auctions).map(a => ({...a[1]}));

    if (page > pageCount) page = 1;

    if (!data) res.json({success: false});

    res.json({
        success: true,
        page,
        pageCount,
        data: data.slice(page * itemsPerPage - itemsPerPage, page * itemsPerPage)
    });
});

router.get('/auctions/:id', async (req, res) => {
    const auctionId = req.params.id;
    let hypixelAuction;

    const auctionDb = await db.auction.findById(auctionId);

    if (!auctionDb) hypixelAuction = await Hypixel.getAuction(auctionId);
    if (!auctionDb && !hypixelAuction) return res.status(404).json({ success: false, message: "No auction found!" });

    if (hypixelAuction) return res.json({ success: true, data: hypixelAuction.auctions[0] });

    res.json({ success: true, data: auctionDb });
});

module.exports = router;