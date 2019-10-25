const Server = require('ws').Server;
const config = require('../config');
const HypixelAuctions = require('./HypixelAuctions');
const wss = new Server({port: config.ws_port});
const jwt = require('jsonwebtoken');
const Database = require('../storage/Mongo');
const User = require('../types/User');
const db = new Database();

class UserConnections {
    constructor() {
        this.connections = new Map();
        this.auctionHandler = new HypixelAuctions();
        this.auctionHandler.init();

        wss.on('listening', () => console.log(`WS listening on port ${config.ws_port}`));      
        wss.on('connection', socket => this.handleLogin(socket));
        setInterval(() => this.dumpDeadConnections(), 1000);

        this.auctionHandler.on('auctionCreated', (id, auction) => this.broadcastMessage(1, auction));
        this.auctionHandler.on('auctionUpdate', (id, auction) => this.handleAuctionUpdate(id, 2, auction));
    }

    handleAuctionUpdate(id, op, msg) {
        const userArray = Array.from(this.connections);

        userArray.filter(user => {
            const userData = user[1];

            if (userData.watchingAuctions.has(id)) this.sendMessage(userData.ws, op, msg);
        });
    }

    sendMessage(sock, op, msg) {
        sock.ws.send(JSON.stringify({op, data: msg}));
    }

    broadcastMessage(op, msg) {
        this.connections.forEach(c => c.ws.send(JSON.stringify({op, data: msg})));
    }

    parseMessage(msg) {
        try {
            return JSON.parse(msg);
        } catch (e) { 
            return {};
        }
    }

    handleLogin(socket) {
        socket.send(JSON.stringify({op: 0}));

        socket.once('message', msg => {
            const data = this.parseMessage(msg);
            if (data.op !== 0) return socket.close();

            const token = jwt.verify(data.token, config.secret);
            const dbData = db.user.findById(token.id);
            if (!dbData) return socket.close();

            this.connections.set(dbData._id, new User(dbData._id, dbData, socket));

            socket.emit('authed', dbData);

            return;
        });
        
        socket.once('close', () => {return;});
    }

    dumpDeadConnections() {
        this.connections.forEach(connection => {
            if (connection.ws.readyState === WebSocket.CLOSED || WebSocket.CLOSING) this.connections.delete(connection.id); 
        });
    }
}

module.exports = UserConnections;