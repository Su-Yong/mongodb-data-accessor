const convertId = require('../util/convert-id');
const extractOptions = require('../util/extract-options');

async function updateElements(db, collection, query, element, options) {
  const { options: mongodbOptions, transaction } = extractOptions(options);
  const pretreatmentQuery = convertId.toMongoDB(query);
  const mongodbElement = convertId.toMongoDB(element);
  // eslint-disable-next-line no-underscore-dangle
  delete mongodbElement._id;

  if (!transaction) {
    const result = await db.collection(collection).updateMany(pretreatmentQuery, {
      $set: mongodbElement,
    }, mongodbOptions);

    if (!result.result.ok) return null;

    return element;
  }

  throw new Error('Internal Server Error (500): Not implemented.');
}

module.exports = updateElements;
