/* eslint-disable class-methods-use-this */
const { Transaction } = require('@acka/sorm');

class MongoDBTransaction extends Transaction {
  constructor(client, document, db) {
    super();

    this.client = client;
    this.document = document;
    this.db = db;
    this.session = this.client.startSession({ /* options */ });

    this.session.startTransaction({
      readConcern: {
        level: 'snapshot',
      },
      writeConcern: {
        w: 'majority',
      },
    });
  }

  async commit() {
    const exec = async () => {
      try {
        await this.session.commitTransaction();

        this.session.endSession();
        return;
      } catch (err) {
        if (Object.prototype.hasOwnProperty.call(err, 'errorLabels') && err.errorLabels.includes('UnknownTransactionCommitResult')) {
          console.log(err);

          await exec();
        } else {
          throw err;
        }
      }
    };

    await exec();
  }

  async rollback(err) {
    console.log(err);
    if (this.session.inTransaction()) await this.session.abortTransaction();

    this.session.endSession();
  }
}

module.exports = MongoDBTransaction;
