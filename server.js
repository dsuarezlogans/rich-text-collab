const http = require('http');
const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const Y = require('yjs');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/client/dist/index.html'));
});

const docs = new Map();

function getYDoc(docName) {
  if (!docs.has(docName)) {
    docs.set(docName, new Y.Doc());
  }
  return docs.get(docName);
}

io.on('connection', (socket) => {
    const docName = socket.handshake.query.docName;
    const ydoc = getYDoc(docName);

    socket.join(docName)

    console.log(`Client connected to doc: ${docName}`);

    try {
      // Send initial state to client
      const fullUpdate = Y.encodeStateAsUpdate(ydoc);
      socket.emit('sync', fullUpdate);
    }
    catch (error) {
      console.error('Error sending initial state:', error);
    }

    // When client sends an update, apply to doc and broadcast to others
    socket.on('sync', (update) => {
        console.log('Received update:', update);
      Y.applyUpdate(ydoc, update);
      socket.to(docName).emit('sync', update)
    });
  });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Yjs WebSocket server with Express running at ws://localhost:${PORT}`)
});
