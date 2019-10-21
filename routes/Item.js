const router = require('express').Router();
const Database = require('../storage/Mongo');
const db = new Database();

router.get('/items', async (req, res) => {
    const allItems = await db.item.find({});
    if (!allItems) return res.json({success: false});

    res.json({success: true, data: allItems});
});

router.get('/items/:id', async (req, res) => {
    const id = req.params.id;
    const item = await db.item.findById(id);
    if (!item) return res.json({success: false});

    res.json({success: true, data: item});
});

module.exports = router;