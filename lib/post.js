var path = require('path')
var Handlebars = require('handlebars')
var natural = require('natural')
var inflector = new natural.NounInflector()
var _ = require('lodash-node/modern')

var events = require('./events')
var templateData = require('./template-data')
var config = require('./config')
var File = require('./file')
var Permalink = require('./permalink')
var Taxonomy = require('./taxonomy')

// store a collection of all posts
var posts = []

function Post(obj, type) {
  posts.push(this)

  this.init(obj, type)
}

Post.prototype.init = function(obj, type) {
  if (obj instanceof File) {
    _.defaults(this, obj.data)
    this.file = obj
    this.type = type
    this.typePlural = type ? inflector.pluralize(type) : null
    this.filename = obj.filename
    this.content = obj.content
    this.extension = this.filename ? path.extname(this.filename) : '.html'
  }
  else {
    _.defaults(this, obj)
  }
  this._mergeData()
}

Post.prototype.registerTaxonomies = function() {

  var _this = this

  _.each(config.taxonomyTypes, function(taxonomyType) {
    var taxonomyTypePlural = inflector.pluralize(taxonomyType)
    var taxonomies = []
    if (_this[taxonomyTypePlural]) {
      _.each(_this[taxonomyTypePlural], function(taxonomyValue) {
        var taxonomy = Taxonomy.getOrCreate(taxonomyType, taxonomyValue)
        taxonomy.posts.push(_this)
        taxonomies.push(taxonomy)
      })
      _this[taxonomyTypePlural] = taxonomies
    }
  })
}

Post.prototype.render = function() {

  events.emit("beforeRenderContent", this)

  // Compile this post's content
  this.content = Handlebars.compile
    (this.content)
    (this._templateData())

  events.emit("afterRenderContent", this)

  // compute the excerpt after any transformations have taken place
  this._makeExcerpt()
}

Post.prototype._templateData = function() {
  return _.extend({}, this, templateData)
}

Post.prototype._mergeData = function() {
  // Posts should go up the layout chain and inherit data from
  // their parents. For example, if 3 posts use the same layout,
  // the pagination option can just be set there to avoid repetition
  // If posts don't have a layout, exit early
  if (!this.layout) return

  this._getLayouts()

  var layoutData = _.pluck(this.layouts, "data")
  _.each(layoutData, function(data) {
    // exit early if no data
    if (!data) return false

    // for query data we want to merge the values with any layout values
    if (this.query && data.query) _.merge(this.query, data.query)

    // all other propertyes can simply use _.defaults
    _.defaults(this, data)
  }, this)

  // setup permalink, do this here as it may have come from the layout data
  this._resolvePermalink()
}

Post.prototype._getLayouts = function() {
  // don't do this more than once
  if (this.layouts) return

  var layout = File.getOrCreate(config.layoutsDirectory + '/' + this.layout + '.html')
  this.layouts = [layout]
  while (layout.data && layout.data.layout) {
    layout = File.getOrCreate(config.layoutsDirectory + '/' + layout.data.layout + '.html')
    this.layouts.push(layout)
  }
}

Post.prototype._resolvePermalink = function() {

  // if the post already has a permalink, return it
  if (this.permalink instanceof Permalink) return this.permalink

  var permalink = this.permalink
    ? this.permalink
    : config.permalink

  this.permalink = new Permalink(permalink, this)
}

Post.prototype._makeExcerpt = function() {
  var excerptLength = config.excerptLength || 40
  if (!this.excerpt) {
    this.excerpt = this.content
      .replace(/(<([^>]+)>)/ig,"")
      .split(' ')
      .slice(0, excerptLength)
      .join(' ')
      .trim()
  }
}

Post.all = function() {
  return posts
}

Post.each = function(cb) {
  _.each(posts, cb)
}

Post.reset = function() {
  posts = []
}

module.exports = Post
