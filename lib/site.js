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

module.exports = _.assign(site, {

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

  _createPlaceholders: function() {
    var _this = this

    // pages are files with header data that aren't
    // any of the custom post type folders
    this._pages = []

    // files are just regulars files that need to be copied
    this._files = []

    // custom post types are stored in the `_posts`
    // object keyed to the post type
    this._posts = {}
    this.config.postTypes.forEach(function(type) {
      _this._posts[inflector.pluralize(type)] = []
    })

    // taxonomies are stored in the `_taxonomies`
    // object keyed to the taxonomy type
    this._taxonomies = {}
    this.config.taxonomies.forEach(function(taxonomy) {
      _this._taxonomies[inflector.pluralize(taxonomy)] = {}
    })
  },

  _walkPosts: function() {
    var types = this.config.postTypes
      , Page = require('./page') // require here to avoid circularity
      , _this = this

    types.forEach(function(type) {
      var typePlural = inflector.pluralize(type)
        , typeFiles = glob.sync('_' + typePlural + '/*.*')
      typeFiles.forEach(function(filename) {
        new Page(File.getOrCreate(filename), type)
      })
    })
  },

  _walkFiles: function() {
    var config = this.config
      , Page = require('./page')
      , files = glob.sync('**/*', {dot: true})
      , _this = this

    files = files.filter(function(filename) {
      // ignore files or directories at the root
      // level that start with an underscore
      if (filename.charAt(0) == '_') return

      // ignore files matching the exlude config array
      var matchesExclude = _.any(config.excludeFiles, function(pattern) {
        return minimatch(filename, pattern, {dot: true})
      })
      if (matchesExclude) return

      // ignore directories
      // TODO: consider async
      if (!fs.statSync(filename).isFile()) return

      // include everything else
      return true
    })

    files.forEach(function(filename) {
      var file = File.getOrCreate(filename)

      // for files with data, add to pages, otherwise add to files
      if (file.data) {
        // files that aren't in a content type folder should not
        // inherit the default permalink since it's assumed they
        // exist at the same location as their destination
        file.data.permalink = filename
        new Page(file)
      }
      else {
        _this._files.push(filename)
      }
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

  _eachPost: function(cb) {
    var posts = this._posts
    this.config.postTypes.forEach(function(type) {
      posts[inflector.pluralize(type)].forEach(function(post) {
        cb(post)
      })
    })
  },

  _setupTemplateData: function() {
    var data = this.templateData = {
      title: this.config.title,
      baseURL: this.config.baseURL
    }

    // create empty arrays to hold the various post types
    this.config.postTypes.forEach(function(type) {
      data[inflector.pluralize(type)] = []
    })

    // populate those newly created arrays
    this._eachPost(function(post) {
      data[post.typePlural].push(post.toTemplateObject())
    })
  },

  _setupTaxonomies: function() {
    var taxonomies = this.config.taxonomies
      , _this = this

    // loop through every post, gather taxonomy data, and
    // populate the taxonomy objects on the main site variable
    this._eachPost(function(post) {
      taxonomies.forEach(function(taxonomy) {
        var taxonomyPlural = inflector.pluralize(taxonomy)
        if (post[taxonomyPlural] && post[taxonomyPlural].length) {
          post[taxonomyPlural].forEach(function(txn) {
            var txnType = _this._taxonomies[taxonomyPlural]
            // for example: _taxonomies['tags']['JavaScript']
            txnType[txn] = txnType[txn] || []
            txnType[txn].push(post)
          })
        }
      })
    })

    debugger

  },

  _setupDestination: function() {
    // remove any previously generated site files
    fs.removeSync(this.config.destination)
  },

  _renderPosts: function() {
    var _this = this
    this.config.postTypes.forEach(function(type) {
      var typePlural = inflector.pluralize(type)
      _this._posts[typePlural].forEach(function(post) {
        post.render()
        post.write()
      })
    })
  },

  _renderPages: function() {
    this._pages.forEach(function(page) {
      page.render()
      page.write()
    })
  },

  _copyFiles: function() {
    var _this = this

    this._files.forEach(function(filename) {
      var destination = path.join(_this.config.destination, filename)

      _this.emit("beforeCopy", filename)

      // TODO: since we've already read this file, look into way
      // to avoid doing this again. Maybe storing the buffer...
      fs.outputFileSync(destination, fs.readFileSync(filename))

      _this.emit("afterCopy", filename)
      console.log("Copying " + filename + " to " + destination)
    })
  },

  build: function() {
    // scan files for data
    this._readConfig()
    this._createPlaceholders()
    this._walkPosts()
    this._walkFiles()
    this._setupTemplateData()
    this._setupTaxonomies()
    this._setupDestination()
    this._loadPlugins()

    this.emit('beforeBuild')

    // create the new site
    this._renderPosts()
    this._renderPages()
    this._copyFiles()

    this.emit('afterBuild')
  },

  serve: function(port) {

  },

  // expose this instance of Handlebars
  addHelper: function() {
    Handlebars.registerHelper.apply(Handlebars, arguments)
  }

})
