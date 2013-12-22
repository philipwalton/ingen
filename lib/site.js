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
  , config = require('./config')

module.exports = _.assign(site, {

  // expose this instance of Handlebars
  Handlebars: Handlebars,

  eachPost: function(cb) {
    var posts = this._posts
    _.each(config.postTypes, function(type) {
      _.each(posts[inflector.pluralize(type)], function(post) {
        cb(post)
      })
    })
  },

  eachTaxonomy: function(cb) {
    _.each(this._taxonomies, function(taxonomyValues, taxonomyTypePlural) {
      var taxonomyType = inflector.singularize(taxonomyTypePlural)
      _.each(taxonomyValues, function(taxonomyValue) {
        cb(taxonomyValue, taxonomyType, taxonomyTypePlural)
      })
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
    this._posts = []

    // taxonomies are stored in the `_taxonomies`
    // object keyed by the taxonomy type
    this._taxonomies = {}
    _.each(config.taxonomyTypes, function(taxonomyType) {
      _this._taxonomies[inflector.pluralize(taxonomyType)] = []
    })
  },

  _walkPosts: function() {
    var postTypes = config.postTypes
      , Page = require('./page') // require here to avoid circularity
      , Post = require('./post') // require here to avoid circularity
      , taxonomies = this._taxonomies

    _.each(postTypes, function(postType) {
      var postTypePlural = inflector.pluralize(postType)
        , postTypeFiles = glob.sync('_' + postTypePlural + '/*.*')
      _.each(postTypeFiles, function(filename) {

        // create post objects for each file with in a post type directory
        var post = new Page(File.getOrCreate(filename), postType)

        // TODO: this is only here temporarily
        new Post(File.getOrCreate(filename), postType)

        // extract taxonomy data from the post
        _.each(taxonomies, function(taxonomyValues, taxonomyTypePlural) {
          if (post[taxonomyTypePlural]) {
            taxonomies[taxonomyTypePlural] = _.union(
              taxonomyValues,
              post[taxonomyTypePlural]
            )
          }
        })

      })
    })

  },

  _walkFiles: function() {
    var Page = require('./page')
      , files = glob.sync('**/*', {dot: true})
      , _this = this

    files = _.filter(files, function(filename) {
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

    // add files in the _pages directory
    files.push.apply(files, glob.sync('_pages/*'))

    _.each(files, function(filename) {
      var file = File.getOrCreate(filename)

      // for files with data, add to pages, otherwise add to files
      if (file.data) {
        // files without a permalink should use their filename instead
        // of the default permalink since it's assumed they exist at
        // the same location as their destination
        if (!file.data.permalink) file.data.permalink = filename

        new Page(file)
      }
      else {
        _this._files.push(filename)
      }
    })
  },

  _registerPartials: function() {
    _.each(glob.sync('_partials/**/*'), function(filename) {
      var partial = path.basename(filename, path.extname(filename))
      Handlebars.registerPartial(partial, fs.readFileSync(filename, 'utf-8'))
    })
  },

  _loadPlugins: function() {
    // get system plugins
    var systemPluginDir = path.resolve(__dirname, '../plugins')
      , systemPlugins = glob.sync('**/*.js', {cwd: systemPluginDir})
    _.each(systemPlugins, function(filename) {
      require(path.resolve(systemPluginDir, filename))
    })

    // get local plugins
    var localPlugins = glob.sync('_plugins/**/*.js')
    _.each(localPlugins, function(filename) {
      require(path.resolve(".", filename))
    })

  },

  _ensureCleanDestination: function() {
    // remove any previously generated site files
    fs.removeSync(config.destination)
  },

  _paginate: function() {
    _.each(this._posts, function(post) {
      post.paginate()
    })
    _.each(this._pages, function(page) {
      page.paginate()
    })
  },

  _renderPosts: function() {
    var Post = require('./post') // require here to avoid circularity

    _.each(Post.all(), function(post) {
      post.render()
    })
    _.each(this._posts, function(post) {
      post.render()
      post.write()
    })
  },

  _renderPages: function() {
    _.each(this._pages, function(page) {
      page.render()
      page.write()
    })
  },

  _copyFiles: function() {
    var _this = this

    _.each(this._files, function(filename) {
      var destination = path.join(config.destination, filename)

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
    this._createPlaceholders()
    this._walkPosts()
    this._walkFiles()
    this._ensureCleanDestination()
    this._registerPartials()
    this._loadPlugins()

    this.emit('beforeBuild')

    // create the new site
    this._paginate()
    this._renderPosts()
    this._renderPages()
    this._copyFiles()

    this.emit('afterBuild')
  }

})
