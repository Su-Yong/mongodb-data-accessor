const convertId = require('../util/convert-id');
const extractOptions = require('../util/extract-options');

async function updateElements(db, collection, query, element, options) {
  const { options: mongodbOptions, transaction } = extractOptions(options);
  const pretreatmentQuery = convertId.toMongoDB(query);
  const mongodbElement = convertId.toMongoDB(element);
  // eslint-disable-next-line no-underscore-dangle
  delete mongodbElement._id;

  let transactionOptions = mongodbOptions;
  if (transaction) transactionOptions = { ...mongodbOptions, session: transaction.session };

  const result = await db.collection(collection).updateMany(pretreatmentQuery, {
    $set: mongodbElement,
  }, transactionOptions);

  if (!result.result.ok) return null;

  return element;
}

module.exports = updateElements;
