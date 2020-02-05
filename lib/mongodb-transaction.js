const { Transaction } = require('@su-yong/database-interface');

class MongoDBTransaction extends Transaction {
  constructor(client, document) {
    super();

    this.client = client;
    this.document = document;
  }

  commit() {
  }

  rollback() {
  }
}

module.exports = MongoDBTransaction;
