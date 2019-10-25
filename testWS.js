const WebSocket = require('ws');
const socket = new WebSocket('ws://localhost:5001');

socket.onopen = (event) => {
    console.log('Connected');
};

socket.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    
    console.log(data);
};

socket.onclose = (event) => {
    console.log('closed', event);
};