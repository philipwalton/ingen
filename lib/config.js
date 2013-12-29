var fs = require('fs-extra')
var _ = require('lodash-node/modern')

var config = {
  // build options
  source: '.',
  destination: '_site',
  excludeFiles: ['_*', '_*/**/*', 'package.json', 'node_modules/**/*'],
  includeFiles: ['.htaccess'],

  // environment options
  env: 'production',

  // plugin options
  excludePlugins: [],

  // post options
  postTypes: ['post'],
  excerptLength: 40,

  // taxonomy options
  taxonomyTypes: [],

  // permalink options
  permalink: '/:title',
}

// if no config file exists, just use an empty object
var overrides = fs.existsSync('_config.json')
  ? fs.readJSONSync('_config.json')
  : {}

Object.defineProperty(config, 'extend', {
  value: function(overrides) {
    if (overrides) _.assign(this, overrides)
    return this
  }
})

module.exports = config.extend(overrides)
