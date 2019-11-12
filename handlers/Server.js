const express = require('express');
const cors = require('cors');
const Users = require('../routes/Users');
const Auctions = require('../routes/Auctions');
const Items = require('../routes/Item');
const Settings = require('../routes/Settings');
const rateLimit = require("express-rate-limit");

const itemLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 500
});

const auctionLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100
});

const userLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 60
});

class Server {
    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    config() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use('/api/items', itemLimit);
        this.app.use('/api/auctions', auctionLimit);
        this.app.use('/api/users', userLimit);
        this.app.use('/api/users', userLimit);
    }

    routes() {
        this.app.use('/api', Users);
        this.app.use('/api', Auctions);
        this.app.use('/api', Items);
        this.app.use('/api', Settings);
        //this.app.use('/api', Islands); planning on adding api token requirement in settings
    }
}

module.exports = Server;