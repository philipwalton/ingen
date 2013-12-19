var fs = require('fs-extra')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , Handlebars = require('handlebars')
  , natural = require('natural')
  , inflector = new natural.NounInflector()
  , site = require('./site')
  , File = require('./file')
  , Permalink = require('./permalink')
  , Query = require('./query')
  , _ = require('lodash')



var nonTemplateProperties = [
  "extension",
  "file",
  "filename",
  "layout",
  "type",
]

function Page(obj, type) {

  this._mergeData(obj, type)

  // store this page on the site object
  if (type) {
    site._posts.push(this)
  } else {
    site._pages.push(this)
  }

}

Page.prototype.paginate = function() {

  // only paginate if there's a query
  if (!this.query) return

  // only paginate a page the first time through
  if (this.query.page > 1) return

  var limit = this.query.limit
    , unpagedQuery = new Query(_.omit(this.query, 'limit', 'page'))
    , postCount = unpagedQuery.run().length
    , pages = Math.ceil(postCount / limit)
    , page = 1
    , obj

  while (++page <= pages) {
    obj = _.cloneDeep(this)
    obj.query.page = page
    obj.permalink = this.permalink.clone().append("page/" + page)

    new Page(obj)
  }
}

Page.prototype.render = function() {

  var data = {
    site: site.templateData,
    page: this,
    content: this.content
  }

  site.emit("beforeRenderContent", this)

  // Compile this page's content
  this.content = Handlebars.compile(this.content)(data)

  site.emit("afterRenderContent", this)

  // looks like marked is converting `'` to `&#39;` which is messing
  // up handlebars so we have to do the handlebars processing of the
  // template first, then the markdown transformations, then the
  // handlebars processing of layouts ... stupid
  site.emit("transformFile", this)

  // compute the excerpt after any transformations have taken place
  this._makeExcerpt()

  site.emit("beforeRenderPage")

  // recursively render the page content up the layout chain
  this.content = (function fn(layout, content) {
    layout = File.getOrCreate('_layouts/' + layout + '.html')
    data.content = content
    content = Handlebars.compile(layout.content)(data)
    return layout.data && layout.data.layout
      ? fn(layout.data.layout, content)
      : content
  }(this.layout, this.content))

  site.emit("afterRenderPage", this)
  console.log("Rendering " + this.title)
}

Page.prototype.write = function() {

  var destination = path.join(site.config.destination, this.permalink.toString())

  site.emit("beforeWrite", this)

  // if destination is a folder, create an index.html
  if (!path.extname(destination)) {
    destination = path.join(destination, "index.html")
  }

  fs.outputFileSync(destination, this.content)

  console.log("Writing " + this.title + " to " + destination)
  site.emit("afterWrite", this)
}

Page.prototype.toTemplateObject = function() {
  return _(this)
    .omit(nonTemplateProperties)
    .omit(_.isFunction)
    .value()
}

Page.prototype._mergeData = function(obj, type) {
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

  // Pages should go up the layout chain and inherit data from
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
  this.permalink = Permalink.getFromPage(this)
}

Page.prototype._getLayouts = function() {
  var layout = File.getOrCreate('_layouts/' + this.layout + '.html')
    , layouts = [layout]
  while (layout.data && layout.data.layout) {
    layout = File.getOrCreate('_layouts/' + layout.data.layout + '.html')
    layouts.push(layout)
  }
  return layouts
}

Page.prototype._makeExcerpt = function() {
  var excerptLength = site.config.excerptLength || 40
  if (!this.excerpt) {
    this.excerpt = this.content
      .replace(/(<([^>]+)>)/ig,"")
      .split(' ')
      .slice(0, excerptLength)
      .join(' ')
      .trim()
  }
}

module.exports = Page
