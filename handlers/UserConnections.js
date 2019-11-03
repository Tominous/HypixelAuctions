const ws = require('ws');
const { EventEmitter } = require('events');
const config = require('../config');
const HypixelAuctions = require('./HypixelAuctions');
const wss = new ws.Server({ port: config.ws_port });
const jwt = require('jsonwebtoken');
const Database = require('../storage/Mongo');
const User = require('../types/User');
const db = new Database();

const btoa = str => Buffer.from(str).toString('base64');
const atob = b64Encoded => Buffer.from(b64Encoded, 'base64').toString('utf8');

class UserConnections extends EventEmitter {
    constructor() {
        super();

        this.connections = new Map();
        this.auctionHandler = new HypixelAuctions();

        wss.on('listening', () => console.log(`WS listening on port ${config.ws_port}`));
        wss.on('connection', socket => this.handleLogin(socket));
        this.auctionHandler.on('auctionCreated', (id, auction) => this.processCreated(id, auction));
        this.auctionHandler.on('auctionUpdated', (id, auction) => this.processUpdate(id, auction));
        setInterval(() => this.dumpDeadConnections(), 1000);
    }

    processCreated(id, auction) {
        this.connections.forEach(user => user.handleAuctionCreated(id, auction));
    }

    processUpdate(id, auction) {
        this.connections.forEach(user => user.handleAuctionUpdate(id, auction));
    }

    sendMessage(sock, op, msg) {
        sock.ws.send(JSON.stringify({ op, data: msg }));
    }

    broadcastMessage(op, msg) {
        this.connections.forEach(c => c.ws.send(JSON.stringify({ op, data: msg })));
    }

    parseMessage(msg) {
        try {
            return JSON.parse(msg);
        } catch (e) {
            return {};
        }
    }

    async handleLogin(socket) {
        socket.send(btoa(JSON.stringify({ op: 0 })));

        socket.once('message', async msg => {
            let token;
            const decoded = atob(msg);
            const data = this.parseMessage(decoded);
            if (data.op !== 0) return socket.close();

            try {
                token = jwt.verify(data.token, config.secret);
            } catch (e) {
                socket.send(btoa(JSON.stringify({ op: 1, success: false, message: "Invalid Token" })));
                return socket.close();
            }

            let dbData = await db.user.findById(token.id);
            if (!dbData) return socket.close();
            dbData.password = undefined;

            this.connections.set(dbData._id, new User(dbData._id, dbData, socket, db));
            socket.send(btoa(JSON.stringify({ op: 1, success: true, data: dbData })));
        });

        socket.once('close', () => { return; });
    }

    dumpDeadConnections() {
        this.connections.forEach(connection => {
            if (connection.ws.readyState !== 1) this.connections.delete(connection.id);
        });
    }
}

module.exports = UserConnections;