const mongoose = require('mongoose');
const config = require('../config');

class Mongo {
    constructor() {
        this.db = mongoose.connect(config.mongodb);

        this.auction = require('./models/Auction');
        this.item = require('./models/Item');
        this.user = require('./models/User');
        this.island = require('./models/Island');
        this.hypixelUser = require('./models/HypixelUser');
    }
}

module.exports = Mongo;