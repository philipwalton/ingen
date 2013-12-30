var fs = require('fs-extra')
var path = require('path')
var glob = require('glob')
var minimatch = require('minimatch')
var mkdirp = require('mkdirp')
var natural = require('natural')
var inflector = new natural.NounInflector()
var Handlebars = require('handlebars')
var connect = require('connect')
var DeepWatch = require('deep-watch')
var _ = require('lodash-node/modern')

var config = require('./config')
var events = require('./events')
var File = require('./file')
var Post = require('./post')
var Page = require('./page')
var Taxonomy = require('./taxonomy')


module.exports = {

  // expose this instance of Handlebars
  Handlebars: Handlebars,

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

    // files are just regulars files that need to be copied
    this._files = []

    // taxonomies are stored in the `_taxonomies`
    // object keyed by the taxonomy type
    this._taxonomies = {}
    _.each(config.taxonomyTypes, function(taxonomyType) {
      _this._taxonomies[inflector.pluralize(taxonomyType)] = []
    })
  },

  _walkPosts: function() {
    var postTypes = config.postTypes
    var taxonomies = this._taxonomies

    _.each(postTypes, function(postType) {
      var postTypePlural = inflector.pluralize(postType)
      var postTypeFiles = glob.sync('_' + postTypePlural + '/*')
      _.each(postTypeFiles, function(filename) {

        // create post objects for each file with in a post type directory
        var post = new Post(File.getOrCreate(filename), postType)

        // convert the post's taxonomy data into Taxonomy instances
        post.registerTaxonomies()

        // if the post specifies a layout, then create a page out of it too
        if (post.layout) new Page(post)
      })

    })
  },

  _walkFiles: function() {
    var files = glob.sync('**/*')
    var _this = this

    files = _.filter(files, function(filename) {
      // ignore files matching the exlude config array
      var matchesExclude = _.any(config.excludeFiles, function(pattern) {
        return minimatch(filename, pattern)
      })
      if (matchesExclude) return

      // ignore directories
      if (!fs.statSync(filename).isFile()) return

      // include everything else
      return true
    })

    // TODO: add logic for the includeFiles here...

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
    _.each(glob.sync(config.partialsDirectory + '/**/*'), function(filename) {
      var partial = path.basename(filename, path.extname(filename))
      Handlebars.registerPartial(partial, fs.readFileSync(filename, 'utf-8'))
    })
  },

  _loadPlugins: function() {
    // get system plugins
    var systemPluginDir = path.resolve(__dirname, '../plugins')
    var systemPlugins = glob.sync('**/*.js', {cwd: systemPluginDir})

    // get local plugins
    var localPlugins = glob.sync('**/*.js', {cwd: config.pluginDirectory})


    // don't load system plugins if there's a local plugin by the same name
    systemPlugins = _.without.apply(_, [systemPlugins].concat(localPlugins))

    // require system plugins
    _.each(systemPlugins, function(filename) {
      require(path.resolve(systemPluginDir, filename))
    })

    // require local plugins
    _.each(localPlugins, function(filename) {
      require(path.resolve(config.pluginDirectory, filename))
    })

  },

  _ensureCleanDestination: function() {
    // remove any previously generated _site files
    fs.removeSync(config.destination)
  },

  _paginate: function() {
    Page.each(function(page) {
      page.paginate()
    })
  },

  _renderPosts: function() {
    Post.each(function(post) {
      post.render()
    })
  },

  _renderPages: function() {
    Page.each(function(page) {
      page.render()
      page.write()
    })
  },

  _copyFiles: function() {
    var _this = this

    _.each(this._files, function(filename) {
      var destination = path.join(config.destination, filename)

      events.emit("beforeCopy", filename)

      // TODO: since we've already read this file, look into way
      // to avoid doing this again. Maybe storing the buffer...
      fs.outputFileSync(destination, fs.readFileSync(filename))

      events.emit("afterCopy", filename)
      console.log("Copying " + filename + " to " + destination)
    })
  },

  _clearCaches: function() {
    Post.reset()
    Page.reset()
    Taxonomy.reset()
  },

  build: function() {

    // things like compile Sass files or minify JS here
    events.emit('start')

    // scan files for data
    this._createPlaceholders()
    this._walkPosts()
    this._walkFiles()
    this._ensureCleanDestination()
    this._registerPartials()
    this._loadPlugins()

    events.emit('beforeBuild')

    // create the new site
    this._paginate()
    this._renderPosts()
    this._renderPages()
    this._copyFiles()

    events.emit('afterBuild')

    // things like compile Sass files or minify JS here
    events.emit('end')
  },

  rebuild: function() {
    this._clearCaches()
    this.build()
  },

  serve: function() {

    var _this = this

    this.build()

    var watchOptions = {exclude: config.watchExcludes}
    var dw = new DeepWatch('.', watchOptions, function(event, filename) {
      console.log(event, filename)
      _this.rebuild(options)
    })

    dw.start()

    connect()
      .use(connect.logger('dev'))
      .use(connect.static('_site'))
      .listen(config.port)
  }

}
