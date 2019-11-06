const router = require('express').Router();
const config = require('../config.json');
const Database = require('../storage/Mongo');
const HypixelAPI = require('../handlers/Hypixel');
const jwt = require('jsonwebtoken');
const Hypixel = new HypixelAPI(config.auctionToken, config.userToken);
const db = new Database();

router.get('/users/:id', async (req, res) => {
    const id = req.params.id;
    let hypixelUser;

    const userDb = await db.users.findById(id);
    if (!userDb) hypixelUser = Hypixel.getUser(id);

    if (!hypixelUser && !userDb) return res.status(404).json({ success: false, message: "No user found." });

    res.json({ success: true, data: userDb });
});

router.post('/users/login', async (req, res) => {
    const data = req.body;
    if (!data.username) return res.status(400).json({ success: false, message: "You must provide a username." });
    if (!data.password) return res.status(400).json({ success: false, message: "You must provide a password." });

    const dbData = await db.user.findOne({ username: data.username });
    if (!dbData) return res.status(404).json({ success: false, message: "User not found." });
    if (dbData.password !== data.password) return res.status(401).json({ success: false, message: "Incorrect password." });

    const token = jwt.sign({ id: dbData._id }, config.secret);

    res.json({ success: true, token });
});

router.post('/users/signup', async (req, res) => {
    const data = req.body;
    if (!data.username) return res.status(400).json({ success: false, message: "You must provide a username." });
    if (!data.password) return res.status(400).json({ success: false, message: "You must provide a password." });

    const dbData = await db.user.findOne({ username: data.username });
    if (dbData) return res.status(400).json({ success: false, message: "Username already exists." });

    const createdUser = await new db.user({ username: data.username, password: data.password }).save();
    const token = jwt.sign({ id: createdUser._id }, config.secret);

    res.json({ success: true, token });
});

router.get('/users/@me', async (req, res) => {
    if (!req.headers.authorization) return res.status(401).json({success: false, message: "No authorization provided."});
    let decoded;

    try {
        decoded = jwt.verify(req.headers.authorization, config.secret);
    } catch (e) {
        return res.status(401).json({success: false, message: "Invalid token."});
    }
    
    if (!decoded.id) return res.status(401).json({success: false, message: "Invalid token."});

    let dbData = await db.user.findById(decoded.id);
    if (!dbData) return res.status(500).json({success: false, message: "There was a problem getting user data."});

    delete dbData.password;
    res.json({success: true, data: dbData});
});

router.post('/users/auctions/:id', async (req, res) => {
    if (!req.headers.authorization) return res.status(401).json({success: false, message: "No authorization provided."});
    if (!req.params.id) return res.status(400).json({success: false, message: "No id provided."});
    let decoded;

    try {
        decoded = jwt.verify(req.headers.authorization, config.secret);
    } catch (e) {
        return res.status(401).json({success: false, message: "Invalid token."});
    }

    if (!decoded.id) return res.status(401).json({success: false, message: "Invalid token."});

    const dbData = await db.user.findById(decoded.id);
    if (!dbData) return res.status(500).json({success: false, message: "Something went wrong."});

    db.user.findByIdAndUpdate(decoded.id, { $push: { watchingAuctions: req.params.id } }, (err, doc) => {
        if (err) return res.status(500).json({success: false, message: "Something went wrong."});

        res.json({success: true, message: "Successfully updated."});
    });
});

router.delete('/users/auctions/:id', async (req, res) => {
    if (!req.headers.authorization) return res.status(401).json({success: false, message: "No authorization provided."});
    if (!req.params.id) return res.status(400).json({success: false, message: "No id provided."});
    let decoded;

    try {
        decoded = jwt.verify(req.headers.authorization, config.secret);
    } catch (e) {
        return res.status(401).json({success: false, message: "Invalid token."});
    }

    if (!decoded.id) return res.status(401).json({success: false, message: "Invalid token."});

    const dbData = await db.user.findById(decoded.id);
    if (!dbData) return res.status(500).json({success: false, message: "Something went wrong."});

    db.user.findByIdAndUpdate(decoded.id, { $pull: { watchingAuctions: req.params.id } }, (err, doc) => {
        if (err) return res.status(500).json({success: false, message: "Something went wrong."});

        res.json({success: true, message: "Successfully updated."});
    });
});

module.exports = router;