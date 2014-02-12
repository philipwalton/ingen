var fs = require('fs-extra')
var _ = require('lodash-node/modern')

var defaultConfig = {

  // build options
  source: '.',
  destination: '_site',
  excludeFiles: [],
  includeFiles: [], // e.g. .htaccess

  // timezone
  timezone: 'America/Los_Angeles',

  // environment options
  env: 'production',

  // template options
  partialsDirectory: '_partials',
  layoutsDirectory: '_layouts',

  // plugin options
  pluginDirectory: '_plugins',
  excludePlugins: [],

  // post options
  postTypes: ['post'],
  excerptLength: 40,
  includeDrafts: false,

  // page options
  permalink: '/:title',

  // taxonomy options
  taxonomyTypes: [],

  // serve options
  port: 4000,
  watch: false,
  watchExcludes: []
}

// if no config file exists, just use an empty object
var userConfig = fs.existsSync('_config.json')
  ? fs.readJSONSync('_config.json')
  : {}

module.exports = Object.create(null, {

  // TODO: config needs to be reassignable for testing

  init: {
    value: function(commandLineOptions) {

      _.assign(this, defaultConfig, userConfig, commandLineOptions)

      // make sure certain files are always excluded
      this.excludeFiles = _.union(
        this.excludeFiles,
        [
          '_*',
          '_*/**/*',
          'package.json',
          'node_modules/**/*'
        ]
      )

      // make sure certain directories are never watched
      this.watchExcludes = _.union(
        this.watchExcludes,
        ['node_modules', this.destination]
      )

      return this
    }
  }

})
