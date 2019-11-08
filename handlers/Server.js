const express = require('express');
const cors = require('cors');
const Users = require('../routes/Users');
const Auctions = require('../routes/Auctions');
const Items = require('../routes/Item');
const Settings = require('../routes/Settings');

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