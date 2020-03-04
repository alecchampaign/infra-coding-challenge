const server = require('./server');
const cluster = require('cluster');
const coreCount = require('os').cpus().length;
const mongo = require('./clients/mongo');

(async () => {
  await mongo.connect();
  await mongo.flushCollections();

  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < coreCount; i++) {
      cluster.fork();
    }

    cluster.on('exit', worker =>
      console.log(`Worker ${worker.process.pid} has died`)
    );
  } else {
    server.listen(9000, () => {
      console.log('server listening on port 9000');
    });

    console.log(`Worker ${process.pid} started`);
  }
})();
