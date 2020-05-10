import express from 'express';
import socketIo from 'socket.io';
import bodyParser from 'body-parser';
import cors from 'cors';
import { App } from '../app';

const expressHttpServer = express();
const baseHttpServer = require('http').createServer(expressHttpServer);
const io = socketIo(baseHttpServer);

io.origins('*:*'); // workaround cors
io.on('connection', (socket) => {

});

expressHttpServer.use(handlers);
expressHttpServer.use(cors());
expressHttpServer.use(bodyParser.json());
expressHttpServer.post('/webhook', (req, res) => {});

baseHttpServer.listen(8000);


function handlers (app: App) {
  const router = express.Router();
  return router;
}
