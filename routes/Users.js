const router = require('express').Router();
const config = require('../config.json');
const Database = require('../storage/Mongo');
const { Client, types: { AUTHORIZATION } } = require('discord-oauth');
const jwt = require('jsonwebtoken');
const db = new Database();
const { getUserData, setUserData } = require('../storage/Redis');
const fetch = require('node-fetch');
const io = require('@pm2/io');
const counter = io.counter({ name: "Users Route Active Handles" });

const oauthClient = new Client(config.id, config.auth_secret);
const auth = oauthClient.create(AUTHORIZATION, {
    scopes: ['identify'],
    redirect: config.callback_url,
    returnUrl: config.return_url
});

router.get('/users/@me', async (req, res) => {
    counter.inc();
    req.on('end', () => counter.dec());

    if (!req.headers.authorization) return res.status(401).json({success: false, message: "No authorization provided."});
    let decoded;

    try {
        decoded = jwt.verify(req.headers.authorization, config.secret);
    } catch (e) {
        return res.status(401).json({success: false, message: "Invalid token."});
    }
    
    if (!decoded.user.id) return res.status(401).json({success: false, message: "Invalid token."});

    let dbData = await db.user.findById(decoded.user.id);
    if (!dbData) return res.status(500).json({success: false, message: "There was a problem getting user data."});

    delete dbData.password;
    res.json({success: true, data: dbData});
});

router.post('/users/auctions/:id', async (req, res) => {
    counter.inc();
    req.on('end', () => counter.dec());

    if (!req.headers.authorization) return res.status(401).json({success: false, message: "No authorization provided."});
    if (!req.params.id) return res.status(400).json({success: false, message: "No id provided."});
    let decoded;

    try {
        decoded = jwt.verify(req.headers.authorization, config.secret);
    } catch (e) {
        return res.status(401).json({success: false, message: "Invalid token."});
    }

    if (!decoded.user.id) return res.status(401).json({success: false, message: "Invalid token."});

    const dbData = await db.user.findById(decoded.user.id);
    if (!dbData) return res.status(500).json({success: false, message: "Something went wrong."});

    db.user.findByIdAndUpdate(decoded.user.id, { $push: { watchingAuctions: req.params.id } }, (err, doc) => {
        if (err) return res.status(500).json({success: false, message: "Something went wrong."});

        res.json({success: true, message: "Successfully updated."});
    });
});

router.delete('/users/auctions/:id', async (req, res) => {
    counter.inc();
    req.on('end', () => counter.dec());

    if (!req.headers.authorization) return res.status(401).json({success: false, message: "No authorization provided."});
    if (!req.params.id) return res.status(400).json({success: false, message: "No id provided."});
    let decoded;

    try {
        decoded = jwt.verify(req.headers.authorization, config.secret);
    } catch (e) {
        return res.status(401).json({success: false, message: "Invalid token."});
    }

    if (!decoded.user.id) return res.status(401).json({success: false, message: "Invalid token."});

    const dbData = await db.user.findById(decoded.user.id);
    if (!dbData) return res.status(500).json({success: false, message: "Something went wrong."});

    db.user.findByIdAndUpdate(decoded.user.id, { $pull: { watchingAuctions: req.params.id } }, (err, doc) => {
        if (err) return res.status(500).json({success: false, message: "Something went wrong."});

        res.json({success: true, message: "Successfully updated."});
    });
});

router.get('/users/mojang/:id', async (req, res) => {
    counter.inc();
    req.on('end', () => counter.dec());

    const id = req.params.id;
    if (!req.headers.authorization) return res.status(401).json({success: false, message: "No authorization provided."});

    let decoded;

    try {
        decoded = jwt.verify(req.headers.authorization, config.secret);
    } catch (e) {
        return res.status(401).json({success: false, message: "Invalid token."});
    }

    if (!decoded.user.id) return res.status(401).json({success: false, message: "Invalid token."});

    const userData = await getUserData(id);

    if (userData) return res.json({success: true, data: userData});

    const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${id}`);
    const data = await response.json();

    if (data.error) return res.json({success: false});

    await setUserData(data.id, data);
    res.json({success: true, data});
});

router.get('/users/login', (req, res) => {
    counter.inc();
    req.on('end', () => counter.dec());

    const url = auth.generate().url;
    res.redirect(url + "&prompt=none");
});

router.get('/users/callback', async (req, res) => {
    counter.inc();
    req.on('end', () => counter.dec());
    
    const data = await auth.callback(req.query);
    const auth_token = jwt.sign({ user: data.bearer.user }, config.secret);

    res.redirect(`https://auctions.craftlink.xyz/auth?token=${auth_token}`);
});

module.exports = router;