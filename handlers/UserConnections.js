const ws = require('ws');
const { EventEmitter } = require('events');
const config = require('../config');
const HypixelAuctions = require('./HypixelAuctions');
const jwt = require('jsonwebtoken');
const Database = require('../storage/Mongo');
const User = require('../types/User');
const db = new Database();
const webServer = require('./Server');
const http = require('http');
const io = require('@pm2/io');
const counter = io.counter({ name: "Live Auction Connections" });

const btoa = str => Buffer.from(str).toString('base64');
const atob = b64Encoded => Buffer.from(b64Encoded, 'base64').toString('utf8');

class UserConnections extends EventEmitter {
    constructor() {
        super();

        this.connections = new Map();
        this.auctionHandler = new HypixelAuctions();
        this.webServer = new webServer();

        this.httpServer = http.createServer(this.webServer.app);

        this.httpServer.listen(config.http_port);
        this.wss = new ws.Server({ server: this.httpServer, path: '/gateway' });

        this.wss.on('listening', () => console.log(`WS listening on port ${config.http_port}`));
        this.wss.on('connection', socket => this.handleLogin(socket));
        this.auctionHandler.on('auctionCreated', (id, auction) => this.processCreated(id, auction));
        this.auctionHandler.on('auctionUpdated', (id, auction) => this.processUpdate(id, auction));
        setInterval(() => this.dumpDeadConnections());
        setInterval(() => this.broadcastMessage(9, {keepAlive: true}), 10000);
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
        this.connections.forEach(c => c.ws.send(btoa(JSON.stringify({ op, data: msg || undefined }))));
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

            let dbData = await db.user.findById(token.user.id);
            counter.inc();
            if (!dbData) await new db.user({ _id: token.user.id, watchingAuctions: [], watchingItems: [], watchingIslands: [], settings: {} }).save((err, res) => {
                if (err) return socket.close();

                this.connections.set(res._id, new User(res._id, res, socket, db));
                return socket.send(btoa(JSON.stringify({ op: 1, success: true, data: res })));
            });

            this.connections.set(dbData._id, new User(dbData._id, dbData, socket, db));
            socket.send(btoa(JSON.stringify({ op: 1, success: true, data: dbData })));
        });

        socket.once('close', () => { return; });
    }

    dumpDeadConnections() {
        this.connections.forEach(connection => {
            if (connection.ws.readyState !== 1) {
                console.log('discoonected')
                this.connections.delete(connection.id);
                counter.dec();
            }
        });
    }
}

module.exports = UserConnections;