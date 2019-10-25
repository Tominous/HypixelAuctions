const Server = require('./Server');
const Auctions = require('./handlers/UserConnections');

const server = new Server();
const auctions = new Auctions();

server.start();