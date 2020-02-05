/* eslint-disable no-param-reassign, no-underscore-dangle */

function convertToMongoDB(object) {
  const mongoObject = { ...object };
  if (!mongoObject._id && mongoObject.id) {
    mongoObject._id = mongoObject.id;
    delete mongoObject.id;
  }

  return mongoObject;
}

function convertFromMongoDB(mongoObject) {
  const object = { ...mongoObject };

  if (!object.id) {
    object.id = object._id;
    delete object._id;
  }

  return object;
}

const convertId = {
  toMongoDB(object) {
    const result = convertToMongoDB(object);
    // eslint-disable-next-line no-restricted-syntax
    for (const i in object) {
      if (typeof object[i] === 'object') result[i] = this.toMongoDB(object[i]);
    }

    return result;
  },

  fromMongoDB(mongoObject) {
    const result = convertFromMongoDB(mongoObject);
    // eslint-disable-next-line no-restricted-syntax
    for (const i in mongoObject) {
      if (typeof mongoObject[i] === 'object') result[i] = this.fromMongoDB(mongoObject[i]);
    }

    return result;
  },
};

/* eslint-enable no-param-reassign, no-underscore-dangle */

module.exports = convertId;
