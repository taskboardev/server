const express  = require('express');
const cors = require('cors');

const server = express();

server.use(cors())

server.get('/ping-auth', (req: any, res: any) => {
  const a = req.header('Authorization')
  res.json(a.toString());
});

server.listen(8001);
