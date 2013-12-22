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

var userConfig = fs.readJSONSync('_config.json')

module.exports = _.defaults(userConfig, defaultConfig)
