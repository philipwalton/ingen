var fs = require('fs')
  , path = require('path')
  , config = JSON.parse(fs.readFileSync('_config.json', 'utf8'))
  , glob = require('glob')
  , minimatch = require('minimatch')
  , Page = require('./page')
  , _ = require('lodash')
  , EventEmitter = require('events').EventEmitter
  , natural = require('natural')
  , inflector = new natural.NounInflector()
  , site = Object.create(EventEmitter.prototype)



var inspect = function(obj) {
  console.log(require('util').inspect(obj, {colors:true}))
}

module.exports = _.assign(site, {

  /**
   * Get config data from _config.json
   *
   * @return {Object}
   * @api private
   */

  _readConfig: function() {
    var config = JSON.parse(fs.readFileSync('_config.json', 'utf8'))
    this.config = _.defaults(config, {
      permalink: "/:title",
      taxonomies: ["category", "tag"],
      excludeFiles: [],
      source: "./",
      destination: "./_site",
      excludePlugins: []
    })
  },

  _getContentTypeFiles: function() {
    var self = this
      , types = this.config.contentTypes

    types.forEach(function(type) {
      var typePlural = inflector.pluralize(type)
      self[typePlural] = glob.sync('_' + typePlural + '/*.*')
    })
  },

  _walkFiles: function() {
    var config = this.config
    this.files = glob
      .sync('**/*', {dot: true})
      .filter(function(filename) {
        // ignore files or directories at the root
        // level that start with an underscore
        if (filename.charAt(0) == '_') return

        var matchesExclude = _.any(config.excludeFiles, function(pattern) {
          return minimatch(filename, pattern)
        })
        // ignore files matching the exlude config array
        if (matchesExclude) return

        // ignore directories
        // TODO: consider async
        if (!fs.statSync(filename).isFile()) return

        // include everything else
        return true
      })
  },

  _loadPlugins: function() {
    var pluginDir = path.resolve(__dirname, '../plugins')
      , plugins = glob.sync('**/*.js', {cwd: pluginDir})

    plugins.forEach(function(filename) {
      require(path.resolve(pluginDir, filename))
    })
  },

  build: function() {

    this._readConfig()
    this._loadPlugins()
    this._getContentTypeFiles()
    this._walkFiles()

    var self = this
      , config = self.config

    inspect(self)

    self.on('article', function(filename) {
      new Page(filename)
    })

    self.on('page', function(filename) {
      new Page(filename)
    })

    self.on('file', function(filename) {
      new Page(filename)
    })

    config.contentTypes.forEach(function(type) {
      var typePlural = inflector.pluralize(type)
      self[typePlural].forEach(function(filename) {
        self.emit(type, filename)
      })
    })

    self.files.forEach(function(filename) {
      self.emit('file', filename)
    })

  },

  serve: function(port) {

  }

})

/*

  Page.addTransformer(function(page) {
    if (page.extension == ".md") {
      return page.renderMarkdown()
    }
  })

  Page.addTransformer(function(page) {
    if (page.extension == ".html") {
      return page.renderTempalte()
    }
  })

  Site.on("beforeBuild", function(site) {})

  Site.on("afterBuild", function(site) {})



*/
