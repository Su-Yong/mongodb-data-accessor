const { DataAccessor } = require('@su-yong/database-interface');
const MongoDBTransaction = require('./mongodb-transaction');

const insertElement = require('./function/insert-element');
const insertElements = require('./function/insert-elements');
const findElement = require('./function/find-element');
const updateElement = require('./function/update-element');
const updateElements = require('./function/update-elements');
const deleteElement = require('./function/delete-element');
const deleteElements = require('./function/delete-elements');

class MongoDBDataAccessor extends DataAccessor {
  constructor(client, collection) {
    super();

    this.client = client;
    this.collection = collection;
    this.db = client.db();
  }

  createTransaction() {
    return MongoDBTransaction(this.client, this.collection);
  }

  bulkCreate(operation, options = {}) {
    return insertElements(this.db, this.collection, operation, options);
  }

  create(element, options = {}) {
    return insertElement(this.db, this.collection, element, options);
  }

  existById(id, options) {
    return this.exist({ id }, options);
  }

  async exist(query, options = {}) {
    return !!await this.findOne(query, options);
  }

  findById(id, options) {
    return this.findOne({ id }, options);
  }

  async findOne(query, options) {
    const result = await this.findAll(query, options);

    if (result) return result[0];
    return null;
  }

  findAll(query, options = {}) {
    return findElement(this.db, this.collection, query, options);
  }

  updateById(id, element, options) {
    return this.updateOne({ id }, element, options);
  }

  updateOne(query, element, options = {}) {
    return updateElement(this.db, this.collection, query, element, options);
  }

  updateAll(query, element, options = {}) {
    return updateElements(this.db, this.collection, query, element, options);
  }

  deleteById(id, options) {
    return this.deleteOne({ id }, options);
  }

  deleteOne(query, options = {}) {
    return deleteElement(this.db, this.collection, query, options);
  }

  deleteAll(query, options = {}) {
    return deleteElements(this.db, this.collection, query, options);
  }
}

module.exports = MongoDBDataAccessor;
