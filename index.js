require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const routes = require('./routes');
const { init, setSocketIO } = require('./utils');

const app = express();
const port = process.env.PORT || 8000;

const server = http.createServer(app); 
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
    console.log('Frontend connected via Socket.IO');
});

setSocketIO(io);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});

app.use('/api', routes);

server.listen(port, async () => {
    await init();
    console.log(`Server is running on http://localhost:${port}`);
});
