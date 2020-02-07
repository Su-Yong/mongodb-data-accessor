const convertId = require('../util/convert-id');
const generateId = require('../util/generate-id');
const extractOptions = require('../util/extract-options');

async function insertElement(db, collection, element, options) {
  const { options: mongodbOptions, transaction } = extractOptions(options);
  // eslint-disable-next-line no-param-reassign
  element.id = element.id || generateId();
  const mongodbElement = convertId.toMongoDB(element);
  let transactionOptions = mongodbOptions;

  if (transaction) transactionOptions = { ...mongodbOptions, session: transaction.session };
  const result = await db.collection(collection).insertOne(mongodbElement, transactionOptions);

  return convertId.fromMongoDB(result.ops[0]);
}

module.exports = insertElement;
