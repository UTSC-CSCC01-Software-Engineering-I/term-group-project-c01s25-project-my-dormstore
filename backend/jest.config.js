export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/scripts/",
    "/coverage/",
    "jest.config.js",
    "prettier.js",
    "sorter.js"
  ]
};