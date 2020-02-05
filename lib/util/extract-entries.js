function extractEntries(object = {}, keys = []) {
  const extractedObject = {};
  keys.forEach((key) => { extractedObject[key] = object[key]; });

  return extractedObject;
}

module.exports = extractEntries;
