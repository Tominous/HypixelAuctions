const Server = require('./Server');
const server = new Server();
const UserConnections = require('./handlers/UserConnections');

const connections = new UserConnections();

server.start();