const { MongoClient } = require('mongodb');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

async function connect() {
  const replSet = new MongoMemoryReplSet({
    debug: false,
    replSet: {
      storageEngine: 'wiredTiger',
    },
  });

  await replSet.waitUntilRunning();
  const uri = await replSet.getUri();

  const client = await MongoClient.connect(`${uri}?replicaSet=rs`);
  await client.db().executeDbAdminCommand({
    setParameter: 1,
    maxTransactionLockRequestTimeoutMillis: 5000,
  });

  return client;
}

module.exports = connect;
