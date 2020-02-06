const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');

const mongod = new MongoMemoryServer();

async function connect() {
  const uri = await mongod.getUri();
  const client = await MongoClient.connect(uri);

  return client;
}

module.exports = connect;
