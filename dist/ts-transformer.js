const {TsJestTransformer} = require('ts-jest/dist/legacy/ts-jest-transformer');
const path = require('path');


const transformerInstance = new TsJestTransformer({
  tsconfig: path.join(__dirname, 'tsconfig.json')
});

module.exports = {
  process(src, filename, config, options) {
    return transformerInstance.process(src, filename, config, options);
  }
};
