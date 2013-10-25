var fs = require('fs')
  , path = require('path')
  , glob = require('glob')
  , minimatch = require('minimatch')
  , EventEmitter = require('events').EventEmitter
  , natural = require('natural')
  , inflector = new natural.NounInflector()
  , site = Object.create(EventEmitter.prototype)
  , Handlebars = require('handlebars')
  , _ = require('lodash')


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
    var _this = this
      , types = this.config.contentTypes

    types.forEach(function(type) {
      var typePlural = inflector.pluralize(type)
      _this[typePlural] = glob.sync('_' + typePlural + '/*.*')
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
          return minimatch(filename, pattern, {dot: true})
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
    // get system plugins
    var systemPluginDir = path.resolve(__dirname, '../plugins')
      , systemPlugins = glob.sync('**/*.js', {cwd: systemPluginDir})
    systemPlugins.forEach(function(filename) {
      require(path.resolve(systemPluginDir, filename))
    })

    // get local systemPlugins
    var localPlugins = glob.sync('_plugins/**/*.js')
    localPlugins.forEach(function(filename) {
      require(path.resolve(".", filename))
    })

  },

  _setupTemplateObject: function() {
    var _this = this

    this.data = {
      title: this.config.title,
      baseURL: this.config.baseURL
    }

    this.config.contentTypes.forEach(function(type) {
      var typePlural = inflector.pluralize(type)
      _this.data[typePlural] = _this[typePlural]
    })
  },

  build: function() {

    this._readConfig()
    this._getContentTypeFiles()
    this._walkFiles()
    this._loadPlugins()
    this._setupTemplateObject()

    var config = this.config
      , Page = require('./page') // require here to avoid circularity
      , _this = this

    inspect(this)

    this.on('article', function(filename) {
      new Page(filename)
    })

    this.on('page', function(filename) {
      new Page(filename)
    })

    this.on('file', function(filename) {
      new Page(filename)
    })

    config.contentTypes.forEach(function(type) {
      var typePlural = inflector.pluralize(type)
      _this[typePlural].forEach(function(filename) {
        _this.emit(type, filename)
      })
    })

    this.files.forEach(function(filename) {
      _this.emit('file', filename)
    })

  },

  serve: function(port) {

  },

  getLayout: function(name) {
    return '_layouts/' + name + '.html'
  },

  // expose this instance of Handlebars
  addHelper: function() {
    Handlebars.registerHelper.apply(Handlebars, arguments)
  }

})
