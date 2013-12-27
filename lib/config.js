var fs = require('fs-extra')
var _ = require('lodash-node/modern')

var defaultConfig = {
  permalink: "/:title",
  taxonomyTypes: [],
  excludeFiles: [],
  source: "./",
  destination: "./_site",
  excludePlugins: []
}

// if no config exists, just use an empty object
var userConfig = fs.existsSync('_config.json')
  ? fs.readJSONSync('_config.json')
  : {}

module.exports = _.defaults(userConfig, defaultConfig)
