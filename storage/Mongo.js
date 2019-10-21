const mongoose = require('mongoose');

class Mongo {
    constructor() {
        this.db = mongoose.connect('');

        this.auction = require('../models/Auction');
        this.item = require('../models/Item');
    }
}

module.exports = Mongo;