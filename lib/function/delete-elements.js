const convertId = require('../util/convert-id');
const extractOptions = require('../util/extract-options');

async function deleteElements(db, collection, query, options) {
  const { options: mongodbOptions, transaction } = extractOptions(options);
  const pretreatmentQuery = convertId.toMongoDB(query, false);

  if (!transaction) {
    const exist = await db.collection(collection).deleteMany(pretreatmentQuery, mongodbOptions);

    return !!exist.result.ok;
  }

  throw new Error('Internal Server Error (500): Not implemented.');
}

module.exports = deleteElements;
