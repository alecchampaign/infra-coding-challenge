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
  const workQueue = new Queue('work', 'redis://127.0.0.1:6379');

  workQueue.process(maxJobsPerWorker, async job => {
    console.log('User? ', job.data);
    somethingSlow(job.data.user_id);
  });
}

throng({ workers, start });
