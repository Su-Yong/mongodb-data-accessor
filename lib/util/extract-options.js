function extractOptions(options) {
  const extractedOption = { ...options };

  const { transaction, projection } = extractedOption;
  delete extractedOption.transaction;
  delete extractedOption.projection;

  return { options: extractedOption, transaction, projection };
}

module.exports = extractOptions;
