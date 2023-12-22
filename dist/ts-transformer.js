const {TsJestTransformer} = require('ts-jest/dist/legacy/ts-jest-transformer');


const transformerInstance = new TsJestTransformer(/* options if any */);

module.exports = {
  process(src, filename, config, options) {
    console.log(filename)
    return transformerInstance.process(src, filename, config, options);
  }
};