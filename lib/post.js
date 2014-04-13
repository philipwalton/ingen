var path = require('path')
var Handlebars = require('handlebars')
var natural = require('natural')
var inflector = new natural.NounInflector()
var _ = require('lodash-node/modern')

var events = require('./events')
var Template = require('./template')
var Permalink = require('./permalink')
var Taxonomy = require('./taxonomy')

function Post(obj, type, config) {
  this.init(obj, type, config)
}

Post.prototype.init = function(obj, type, config) {

  // `type` can be optional.
  if (typeof type == 'object') {
    config = type;
    type = config.postTypes[0] // Assume first type is default.
  }

  this.config = config
  if (obj instanceof Template) {
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

  // this._mergeData()
  this._resolvePermalink()
}

Post.prototype.registerTaxonomies = function() {

  var _this = this

  _.each(this.config.taxonomyTypes, function(taxonomyType) {
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

  events.emit('beforeRenderContent', this)

  // Compile this post's content
  this.content = Handlebars.compile
    (this.content)
    (this._templateData())

  events.emit('afterRenderContent', this)

  // compute the excerpt after any transformations have taken place
  this._makeExcerpt()
}

Post.prototype._templateData = function() {
  return _.extend({ site: this.config}, this)
}

/*
Post.prototype._mergeData = function() {
  // Posts should go up the layout chain and inherit data from
  // their parents. For example, if 3 posts use the same layout,
  // the pagination option can just be set there to avoid repetition
  // If posts don't have a layout, exit early
  if (!this.layout) return

  this._getLayouts()

  var layoutData = _.pluck(this.layouts, 'data')
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

  var layout = Template.getOrCreateFromFile(this.config.layoutsDirectory + '/' + this.layout + '.html')
  this.layouts = [layout]
  while (layout.data && layout.data.layout) {
    layout = Template.getOrCreateFromFile(this.config.layoutsDirectory + '/' + layout.data.layout + '.html')
    this.layouts.push(layout)
  }
}
*/

Post.prototype._resolvePermalink = function() {
  // if the post already has a permalink, return it
  if (this.permalink instanceof Permalink) return

  this.permalink = new Permalink(this.permalink || this.config.permalink , {
    pagenum: this.pagenum,
    title: this.title,
    filename: this.filename,
    type: this.type,
    date: this.date,
    timezone: this.config.timezone
  })
}

Post.prototype._makeExcerpt = function() {
  var excerptLength = this.config.excerptLength || 40
  if (!this.excerpt) {
    this.excerpt = this.content
      .replace(/\s+/g, ' ') // convert new lines and tabs to just spaces
      .replace(/(<([^>]+)>)/ig,'') // strip html tags
      .split(' ')
      .slice(0, excerptLength)
      .join(' ')
      .trim()
  }
}

module.exports = Post
