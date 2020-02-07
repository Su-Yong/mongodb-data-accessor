const convertId = require('../util/convert-id');
const extractOptions = require('../util/extract-options');

async function deleteElements(db, collection, query, options) {
  const { options: mongodbOptions, transaction } = extractOptions(options);
  const pretreatmentQuery = convertId.toMongoDB(query, false);

  let transactionOptions = mongodbOptions;

  if (transaction) transactionOptions = { ...mongodbOptions, session: transaction.session };

  const exist = await db.collection(collection).deleteMany(pretreatmentQuery, transactionOptions);

  return !!exist.result.ok;
}

module.exports = deleteElements;
