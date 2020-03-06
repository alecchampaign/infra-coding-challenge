const express = require('express');
const bodyParser = require('body-parser');
const Queue = require('bull');
const workQueue = new Queue('work', {
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379
  }
});

const mongo = require('./clients/mongo');

const server = express();

server.use(bodyParser.json());

server.get('/health', (_, res) => {
  return res.sendStatus(204);
});

server.post('/users', async (req, res) => {
  const user = await mongo.user.create(req.body);
  // await somethingSlow(user._id);
  const job = await workQueue.add({ user_id: user._id });

  return res.status(200).json(user);
});

server.delete('/collections', async (req, res) => {
  await mongo.flushCollections();
  return res.sendStatus(200);
});

module.exports = server;
