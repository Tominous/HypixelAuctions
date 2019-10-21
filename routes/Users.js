const router = require('express').Router();
const config = require('../config.json');
const Database = require('../storage/Mongo');
const HypixelAPI = require('../hypixel/index');
const Hypixel = new HypixelAPI(config.token);
const db = new Database();

router.get('/users/:id', (req, res) => {
    const id = req.params.id;
    let hypixelUser;

    const userDb = await db.users.findById(id);
    if (!userDb) hypixelUser = Hypixel.getUser(id);

    if (!hypixelUser && !userDb) return res.status(404).json({success: false, message: "No user found."});

    res.json({success: true, data: userDb});
});