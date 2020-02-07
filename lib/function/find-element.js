const convertId = require('../util/convert-id');
const extractOptions = require('../util/extract-options');
const extractEntries = require('../util/extract-entries');

async function findElement(db, collection, query, options) {
  const { options: mongodbOptions, transaction, projection } = extractOptions(options);
  const pretreatmentQuery = convertId.toMongoDB(query, false);

  let transactionOptions = mongodbOptions;

  if (transaction) transactionOptions = { ...mongodbOptions, session: transaction.session };

  const result = await db.collection(collection).find(pretreatmentQuery, transactionOptions);
  let elements = await result.toArray();

  if (elements) {
    elements = elements.map((e) => convertId.fromMongoDB(e));
    if (projection) elements = elements.map((e) => extractEntries(e, projection));
  }

  return elements;
}

module.exports = findElement;
