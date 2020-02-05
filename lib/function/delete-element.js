const convertId = require('../util/convert-id');
const extractOptions = require('../util/extract-options');

async function deleteElement(db, collection, query, options) {
  const { options: mongodbOptions, transaction } = extractOptions(options);
  const pretreatmentQuery = convertId.toMongoDB(query, false);

  if (!transaction) {
    const exist = await db.collection(collection).deleteOne(pretreatmentQuery, mongodbOptions);

    return !!exist.result.ok;
  }

  throw new Error('Internal Server Error (500): Not implemented.');
}

module.exports = deleteElement;
