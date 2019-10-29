const router = require('express').Router();
const Database = require('../storage/Mongo');
const db = new Database();

router.get('/items', async (req, res) => {
    const allItems = await db.item.find({});
    if (!allItems) return res.json({success: false});

    res.json({success: true, data: allItems});
});

router.get('/items/:name', async (req, res) => {
    const name = req.params.name;
    const item = await db.item.findOne({name});
    if (!item) return res.json({success: false});

    res.json({success: true, data: item});
});

module.exports = router;