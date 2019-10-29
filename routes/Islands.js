const router = require('express').Router();
const config = require('../config.json');
const Database = require('../storage/Mongo');
const HypixelAPI = require('../handlers/Hypixel');
const { auctionList } = require('../handlers/AuctionCache');
const Hypixel = new HypixelAPI(config.auctionToken, config.userToken);
const db = new Database();

router.get('/islands/:id/auctions', async (req, res) => {
    const id = req.params.id;
    const auctionArray = Array.from(auctionList);
    const auctions = auctionArray.filter(a => a[1].profile_id === id); 

    res.json({success: true, data: auctions});
});

router.get('/islands/:id', async (req, res) => {
    const id = req.params.id;
    let islandData = await db.island.findById(id);

    if (!islandData) islandData = await Hypixel.getIsland(id);
    if (!islandData) return res.status(404).json({success: false, message: "No island found."});

    await new db.island({_id: islandData.profile.uuid, members: islandData.profile.members }).save();

    res.json({success: true, data: islandData});
});

router.get('/islands/members/:id', async (req, res) => {
    const id = req.params.id;
    let userData = await db.hypixelUser.findById(id);
    
    if (!userData) userData = await Hypixel.getUser(id);
    if (!userData) return res.status(404).json({success: false, message: "No island found."});

    const playerIsland = userData.player.stats.SkyBlock.profiles;

    await new db.hypixelUser({_id: userData.uuid, playername: userData.player.playername, displayname: userData.player.displayname, islands: playerIsland}).save();

    res.json({success: true, data: userData.player});
});

module.exports = router;