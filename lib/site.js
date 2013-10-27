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

  _walkPosts: function() {
    var types = this.config.postTypes
      , Page = require('./page') // require here to avoid circularity
      , _this = this

    // create the object to hold all the custom post data
    this._posts = {}

    types.forEach(function(type) {
      var typePlural = inflector.pluralize(type)
        , typeFiles = glob.sync('_' + typePlural + '/*.*')
      _this._posts[typePlural] = typeFiles.map(function(filename) {
        return new Page(File.getOrCreate(filename), type)
      })
    })
  },

  _walkFiles: function() {
    var config = this.config
      , Page = require('./page')
      , files = glob.sync('**/*', {dot: true})
      , _this = this

    // pages are files with header data that aren't
    // any of the custom post type folders
    this._pages = []

    // files are just regulars files that need to be copied
    this._files = []

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
        _this._pages.push(new Page(file))
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

  getPosts: function() {
    var posts = []
      , _this = this

    this.config.postTypes.forEach(function(type) {
      var typePlural = inflector.pluralize(type)
      _this._posts[typePlural].forEach(function(post) {
        posts.push(post)
      })
    })

    return posts
  },

  _setupTemplateData: function() {
    var _this = this
    var excludeProps = [
      "extension",
      "file",
      "filename",
      "layout",
      "type",
    ]

    this.templateData = {
      title: this.config.title,
      baseURL: this.config.baseURL
    }

    // create empty arrays to hold the various post types
    this.config.postTypes.forEach(function(type) {
      _this.templateData[inflector.pluralize(type)] = []
    })

    // populate those newly created arrays
    this.getPosts().forEach(function(post) {
      _this.templateData[post.typePlural].push(
        _(post)
          .omit(excludeProps)
          .omit(_.isFunction)
          .value()
      )
    })
  },

  _setupTaxonomies: function() {
    var taxonomies = this.config.taxonomies
      , posts = this.getPosts()
      , _this = this
      , txnData = this.templateData

    // loop through every post, gather taxonomy data, and
    // populate the taxonomy objects on the main site variable
    this.getPosts().forEach(function(post) {
      taxonomies.forEach(function(taxonomy) {
        var taxonomyPlural = inflector.pluralize(taxonomy)
        if (post[taxonomyPlural] && post[taxonomyPlural].length) {
          txnData[taxonomyPlural] = txnData[taxonomyPlural] || {}
          post[taxonomyPlural].forEach(function(txn) {
            txnData[taxonomyPlural][txn] = txnData[taxonomyPlural][txn] || []
            txnData[taxonomyPlural][txn].push(post)
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
