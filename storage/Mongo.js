const mongoose = require('mongoose');
const config = require('../config');

class Mongo {
    constructor() {
        this.db = mongoose.connect(config.mongodb);

        this.auction = require('./models/Auction');
        this.item = require('./models/Item');
        this.user = require('./models/User');
    }
}

module.exports = Mongo;