const { resolveLocalNxPlugin } = require('nx/src/utils/nx-plugin');
resolveLocalNxPlugin(require('../../../package.json').name);

module.exports = require('./generator.ts');
