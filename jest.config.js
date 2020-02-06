module.exports = {
  verbose: true,
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/config/',
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
