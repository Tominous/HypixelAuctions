const express = require('express');
const config = require('./config');
const cors = require('cors');
const Users = require('./routes/Users');
const Auctions = require('./routes/Auctions');
const Items = require('./routes/Item');
const Islands = require('./routes/Islands');

class Server {
    constructor() {
        this.app = express();
        this.config(); 
        this.routes();
    }

    config() {
        this.app.set('port', config.http_port || 5000);
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
    }

    routes() {
        this.app.use('/api', Users);
        this.app.use('/api', Auctions);
        this.app.use('/api', Items);
        this.app.use('/api', Islands);
    }
 
    start() {
        this.app.listen(this.app.get('port'), () => console.log(`HTTP running on port ${this.app.get('port')}`)); 
    }
}

module.exports = Server;