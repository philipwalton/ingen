var path = require('path')
var Handlebars = require('handlebars')
var natural = require('natural')
var inflector = new natural.NounInflector()
var _ = require('lodash-node/modern')

var site = require('./site')
var templateData = require('./template-data')
var File = require('./file')
var Permalink = require('./permalink')
var config = require('./config')

// store a collection of all posts
var posts = []


function Post(obj, type) {

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
  posts.push(this)
}


Post.prototype.render = function() {

  site.emit("beforeRenderContent", this)

  // Compile this page's content
  this.content = Handlebars.compile(this.content)(templateData)

  site.emit("afterRenderContent", this)

  // compute the excerpt after any transformations have taken place
  this._makeExcerpt()
}

Post.prototype._mergeData = function() {
  // Posts should go up the layout chain and inherit data from
  // their parents. For example, if 3 pages use the same layout,
  // the pagination option can just be set there to avoid repetition
  var layoutData = _.pluck(this._getLayouts(), "data")
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
  var layout = File.getOrCreate('_layouts/' + this.layout + '.html')
    , layouts = [layout]
  while (layout.data && layout.data.layout) {
    layout = File.getOrCreate('_layouts/' + layout.data.layout + '.html')
    layouts.push(layout)
  }
  return layouts
}

Post.prototype._resolvePermalink = function() {

  // if the page already has a permalink, return it
  if (this.permalink instanceof Permalink) return this.permalink

  var permalink = this.permalink
    ? this.permalink
    : config.permalink

  var data =  {
    type: this.type,
    title: this.title,
    date: moment(this.date),
    pagenum: this.pagenum
  }

  this.permalink = new Permalink(permalink, data)
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

Post.reset = function() {
  posts = []
}

module.exports = Post
