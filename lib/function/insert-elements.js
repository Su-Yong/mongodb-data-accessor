const convertId = require('../util/convert-id');
const generateId = require('../util/generate-id');
const extractOptions = require('../util/extract-options');

async function insertElements(db, collection, elements, options) {
  const { options: mongodbOptions, transaction } = extractOptions(options);
  const mongoOperations = elements.map((element) => {
    // eslint-disable-next-line no-param-reassign
    element.id = generateId();
    return convertId.toMongoDB(element);
  });
  let transactionOptions = mongodbOptions;

  if (transaction) transactionOptions = { ...mongodbOptions, session: transaction.session };

  const result = await db.collection(collection).bulkWrite(mongoOperations, transactionOptions);

  return result.result;
}

module.exports = insertElements;
