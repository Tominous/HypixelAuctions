const express = require('express');
const config = require('./config');

class Server {
    constructor() {
        this.app = express();
        this.config(); 
        this.routes();
    }

    config() {
        this.app.set('port', config.http_port || 5000);
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
    }

    routes() {
        //none
    }
 
    start() {
        this.app.listen(this.app.get('port'), () => console.log(`HTTP running on port ${this.app.get('port')}`)); 
    }
}

module.exports = Server;