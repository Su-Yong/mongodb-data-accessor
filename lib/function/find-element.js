const convertId = require('../util/convert-id');
const extractOptions = require('../util/extract-options');
const extractEntries = require('../util/extract-entries');

async function findElement(db, collection, query, options) {
  const { options: mongodbOptions, transaction, projection } = extractOptions(options);
  const pretreatmentQuery = convertId.toMongoDB(query, false);

  if (!transaction) {
    const result = await db.collection(collection).find(pretreatmentQuery, mongodbOptions);
    let elements = await result.toArray();

    if (elements) {
      elements = elements.map((e) => convertId.fromMongoDB(e));
      if (projection) elements = elements.map((e) => extractEntries(e, projection));
    }

    return elements;
  }

  throw new Error('Internal Server Error (500): Not implemented.');
}

module.exports = findElement;
