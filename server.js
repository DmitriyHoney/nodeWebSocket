'use strict';

const fs = require('fs');
const http = require('http');
const ws = require('ws');

const HOST = 'localhost';
const PORT = 8000;

const indexHtml = fs.readFileSync('./index.html', 'utf-8');
const tableHtml = fs.readFileSync('./table.html', 'utf-8');

const routing = {
  '/': indexHtml,
  '/table': tableHtml
};

const types = {
  string: (s) => s,
  number: (n) => n,
  object: JSON.stringify,
  undefined: () => 'Not Found'
};

console.log(typeof indexHtml);

const server = http.createServer((req, res) => {
  const data = routing[req.url];
  const type = typeof data;
  const serializer = types[type];
  res.end(serializer(data));
});

const webSocket = new ws.WebSocketServer({ server });

webSocket.on('connection', (socket, req) => {
  const ip = req.socket.remoteAddress;
  console.log('connection', Object.keys(webSocket.clients));
  socket.on('message', (msg) => {
    for (const client of webSocket.clients) {
      const isCurrentClient = client === socket;
      if (!isCurrentClient) client.send(msg, { binary: false });
    }
  });
  socket.on('close', () => {
    console.log(`Disconnected ${ip}`);
  });
});

server.listen(8000, () => {
  console.log(`Server connected on http://${HOST}:${PORT}`);
});
