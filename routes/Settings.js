const router = require('express').Router();
const config = require('../config.json');
const Database = require('../storage/Mongo');
const jwt = require('jsonwebtoken');
const db = new Database();
const io = require('@pm2/io');
const counter = io.counter({ name: "Settings Route Active Handles" });

router.get('/settings', async (req, res) => {
    counter.inc();
    req.on('end', () => counter.dec());

    if (!req.headers.authorization) return res.status(401).json({success: false, message: "No token provided."});

    let decoded;
    try {
        decoded = jwt.verify(req.headers.authorization, config.secret);
    } catch (e) {
        return res.status(401).json({success: false, message: "Invalid token."});
    }

    if (!decoded.user.id) return res.status(401).json({success: false, message: "Invalid token."});

    let userData = await db.user.findById(decoded.user.id);
    if (!userData) return res.status(401).json({success: false, message: "Invalid token."});
    userData.password = undefined;

    res.json({success: true, data: userData});
});

router.post('/settings', async (req, res) => {
    counter.inc();
    req.on('end', () => counter.dec());

    const data = req.body;
    if (!req.headers.authorization) return res.status(401).json({success: false, message: "No token provided."});

    let decoded;
    try {
        decoded = jwt.verify(req.headers.authorization, config.secret);
    } catch (e) {
        return res.status(401).json({success: false, message: "Invalid token."});
    }

    if (!decoded.user.id) return res.status(401).json({success: false, message: "Invalid token."});

    let userData = await db.user.findById(decoded.user.id);
    if (!userData) return res.status(401).json({success: false, message: "Invalid token."});

    let updateData = await db.user.findByIdAndUpdate(decoded.user.id, { $set: {settings: data} });
    updateData.password = undefined;

    res.json({success: true, data: updateData});
});

module.exports = router;