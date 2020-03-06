const throng = require('throng');
const Queue = require('bull');
const mongo = require('./clients/mongo');
const { sleep, generateRandomNum } = require('./utils');

const workers = 2;
const maxJobsPerWorker = 50;

async function somethingSlow(userID) {
  await mongo.user.updateOne({ _id: userID }, { $set: { processed: true } });

  const sleepSeconds = generateRandomNum(5, 15);
  return await sleep(sleepSeconds * 1000);
}

function start() {
  const workQueue = new Queue('work', {
    redis: {
      host: process.env.REDIS_HOST,
      port: 6379
    }
  });

  workQueue.process(maxJobsPerWorker, async job => {
    somethingSlow(job.data.user_id);
  });
}

throng({ workers, start });
