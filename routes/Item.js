const router = require('express').Router();
const Database = require('../storage/Mongo');
const db = new Database();

router.get('/items', async (req, res) => {
    const name = req.query.name;
    const item = await db.item.findOne({name});

    if (!name) {
        const items = await db.item.find({});
        if (!items) return res.json({success: false});

        return res.json({success: true, data: items});
    }

    if (!item) return res.json({success: false, data: {}, message: "Item not found."});

    res.json({success: true, data: item});
});

module.exports = router;