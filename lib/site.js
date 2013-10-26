var fs = require('fs-extra')
  , path = require('path')
  , glob = require('glob')
  , minimatch = require('minimatch')
  , mkdirp = require('mkdirp')
  , EventEmitter = require('events').EventEmitter
  , natural = require('natural')
  , inflector = new natural.NounInflector()
  , site = Object.create(EventEmitter.prototype)
  , Handlebars = require('handlebars')
  , _ = require('lodash')
  , File = require('./file')

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
    var types = this.config.contentTypes
      , _this = this

    types.forEach(function(type) {
      var typePlural = inflector.pluralize(type)
      _this[typePlural] = glob.sync('_' + typePlural + '/*.*').map(function(filename) {
        return File.getOrCreate(filename).data
      })
    })
  },

  _walkFiles: function() {
    var config = this.config

    this.files = glob.sync('**/*', {dot: true})
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

    // get local plugins
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

  _setupDestination: function() {
    // remove any previously generated site files
    fs.removeSync(this.config.destination)
  },

  build: function() {

    var _this = this

    this._readConfig()
    this._getContentTypeFiles()
    this._walkFiles()
    this._loadPlugins()
    this._setupTemplateObject()
    this._setupDestination()

    inspect(this)

    var config = this.config
      , Page = require('./page') // require here to avoid circularity
      , _this = this

    config.contentTypes.forEach(function(type) {
      var typePlural = inflector.pluralize(type)
      _this[typePlural].forEach(function(fileData) {
        new Page(File.getOrCreate(fileData.filename), type)
      })
    })

    // for files in the file systems (not in a content type director)
    this.files.forEach(function(filename) {
      var file = File.getOrCreate(filename)

      // for files with data, create a page, otherwise just copy
      if (file.data) {

        // files that aren't in a content type folder should not
        // inherit the default permalink since it's assumed they
        // exist at the same location as their destination
        file.data.permalink = filename

        new Page(file)

      } else {

        _this.emit("beforeCopy", filename)

        var destination = path.join(_this.config.destination, filename)

        // TODO: since we've already read this file, look into way
        // to avoid doing this again. Maybe storing the buffer...
        fs.outputFileSync(destination, fs.readFileSync(filename))

        _this.emit("afterCopy", file)
        console.log("Copying " + filename + " to " + destination)
      }
    })

  },

  serve: function(port) {

  },

  // expose this instance of Handlebars
  addHelper: function() {
    Handlebars.registerHelper.apply(Handlebars, arguments)
  }

})
