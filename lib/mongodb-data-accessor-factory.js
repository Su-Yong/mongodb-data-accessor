const { DataAccessorFactory } = require('@su-yong/database-interface');
const MongoDBDataAccessor = require('./mongodb-data-accessor');

class MongoDBDataAccessorFactory extends DataAccessorFactory {
  constructor(client) {
    super();

    this.client = client;
  }

  create(collection) {
    if (!MongoDBDataAccessorFactory.pool.has(collection)) {
      let dataAccessor;
      if (MongoDBDataAccessorFactory.constructorPool.has(collection)) {
        const DataAccessor = MongoDBDataAccessorFactory.constructorPool.get(collection);
        dataAccessor = new DataAccessor(this.client);
      } else {
        dataAccessor = new MongoDBDataAccessor(this.client, collection);
      }

      MongoDBDataAccessorFactory.pool.set(collection, dataAccessor);
    }
    return MongoDBDataAccessorFactory.pool.get(collection);
  }
}

MongoDBDataAccessorFactory.pool = new Map();
MongoDBDataAccessorFactory.constructorPool = new Map();


module.exports = MongoDBDataAccessorFactory;
