const router = require('express').Router();
const Database = require('../storage/Mongo');
const db = new Database();
const io = require('@pm2/io');
const counter = io.counter({ name: "Items Route Active Handles" });

router.get('/items', async (req, res) => {
    counter.inc();
    req.on('end', () => counter.dec());

    let page = req.query.page || 1;
    const itemsPerPage = req.query.items || 10;
    const filter = JSON.parse(req.query.filter);
    let items;
    let pageCount;

    if (filter.name) {
        if (page === "1") page = page - 1
        pageCount = await db.item.find({ $text: { $search: filter.name } }).countDocuments();
        items = await db.item.find({ $text: { $search: filter.name } }).skip(itemsPerPage * page).limit(itemsPerPage);
    } else {
        pageCount = await db.item.countDocuments();
        items = await db.item.find({}).skip(itemsPerPage * page).limit(itemsPerPage);
    }

    let totalSales = [];

    items.map(i => totalSales.push(i.pastPrices.filter(i => i.date > (Date.now() - 86400000)).length));
    const itemCapped = items.map(i => i.pastPrices.slice(i.pastPrices.length - 100, i.pastPrices.length));
    items.map((item, i) => item.pastPrices = itemCapped[i]);

    if (!items) return res.json({ success: false, data: [], message: "We got some issues going on bruh." });

    res.json({ success: true, data: items, sales: totalSales, page, pageCount: Math.round(pageCount / itemsPerPage) });
});

router.get('/items/id/:id', async (req, res) => {
    counter.inc();
    req.on('end', () => counter.dec());

    const id = req.params.id;
    const timestamp = req.query.timestamp;

    let item = await db.item.findById(id);
    if (!item) return res.json({ success: false, data: {}, message: "Item not found." });

    const pastDay = item.pastPrices.filter(i => i.date > (Date.now() - timestamp || 86400000)).length;
    item.pastPrices = item.pastPrices.filter(i => i.date > (Date.now() - timestamp || 86400000));
    res.json({ success: true, data: item, pastDay });
});

router.get('/items/:name', async (req, res) => {
    counter.inc();
    req.on('end', () => counter.dec());

    const name = req.params.name;
    let item = await db.item.findOne({ name });
    if (!item) return res.json({ success: false, data: {}, message: "Item not found." });

    item.pastPrices = item.pastPrices.filter(i => i.date > (Date.now() - 86400000));
    item.pastPrices = item.pastPrices.slice(item.pastPrices.length - 100, item.pastPrices.length);
    res.json({ success: true, data: item });
});


module.exports = router;