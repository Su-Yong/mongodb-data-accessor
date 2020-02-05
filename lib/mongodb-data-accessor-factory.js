const { DataAccessorFactory } = require('@su-yong/database-interface');
const MongoDBDataAccessor = require('./mongodb-data-accessor');

class MongoDBDataAccessorFactory extends DataAccessorFactory {
  constructor(client) {
    super();

    this.client = client;
  }

  create(document) {
    if (!MongoDBDataAccessorFactory.pool.has(document)) {
      let dataAccessor;
      if (MongoDBDataAccessorFactory.constructorPool.has(document)) {
        const DataAccessor = MongoDBDataAccessorFactory.constructorPool.get(document);
        dataAccessor = new DataAccessor(this.client);
      } else {
        dataAccessor = new MongoDBDataAccessor(this.client, document);
      }

      MongoDBDataAccessorFactory.pool.set(document, dataAccessor);
    }
    return MongoDBDataAccessorFactory.pool.get(document);
  }
}

MongoDBDataAccessorFactory.pool = new Map();
MongoDBDataAccessorFactory.constructorPool = new Map();


module.exports = MongoDBDataAccessorFactory;
