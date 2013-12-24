var fs = require('fs-extra')
var path = require('path')
var util = require('util')
var mkdirp = require('mkdirp')
var natural = require('natural')
var inflector = new natural.NounInflector()
var Handlebars = require('handlebars')
var _ = require('lodash')

var templateData = require('./template-data')
var config = require('./config')
var events = require('./events')
var File = require('./file')
var Post = require('./post')
var Permalink = require('./permalink')
var Query = require('./query')

// store a collection of all pages
var pages = []

function Page(obj, type) {

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

  this._mergeData(obj, type)
  pages.push(this)
}

util.inherits(Page, Post)

Page.prototype.paginate = function() {

  // only paginate if there's a query
  if (!this.query) return

  // only paginate a page the first time through
  if (this.query.page > 1) return

  var limit = this.query.limit
  var unpagedQuery = new Query(_.omit(this.query, 'limit', 'page'), Post.all())
  var postCount = unpagedQuery.run().length
  var pages = Math.ceil(postCount / limit)
  var page = 1
  var obj

  while (++page <= pages) {
    obj = _.cloneDeep(this)
    obj.query.page = page
    obj.permalink = this.permalink.clone().append("page/" + page)

    new Page(obj)
  }
}

Page.prototype.render = function() {

  var data = _.assign({}, templateData, {
    page: this,
    content: this.content
  })

  events.emit("beforeRenderContent", this)

  // Compile this page's content
  this.content = Handlebars.compile(this.content)(data)

  // looks like marked is converting `'` to `&#39;` which is messing
  // up handlebars so we have to do the handlebars processing of the
  // template first, then the markdown transformations, then the
  // handlebars processing of layouts ... stupid
  events.emit("afterRenderContent", this)

  // compute the excerpt after any transformations have taken place
  this._makeExcerpt()

  events.emit("beforeRenderPage")

  // recursively render the page content up the layout chain
  this.content = (function fn(layout, content) {
    layout = File.getOrCreate('_layouts/' + layout + '.html')
    data.content = content
    content = Handlebars.compile(layout.content)(data)
    return layout.data && layout.data.layout
      ? fn(layout.data.layout, content)
      : content
  }(this.layout, this.content))

  events.emit("afterRenderPage", this)
  console.log("Rendering " + this.title)
}

Page.prototype.write = function() {

  var destination = path.join(config.destination, this.permalink.toString())

  events.emit("beforeWrite", this)

  // if destination is a folder, create an index.html
  if (!path.extname(destination)) {
    destination = path.join(destination, "index.html")
  }

  fs.outputFileSync(destination, this.content)

  console.log("Writing " + this.title + " to " + destination)
  events.emit("afterWrite", this)
}

Page.all = function() {
  return pages
}

Page.each = function(cb) {
  _.each(pages, cb)
}

Page.reset = function() {
  pages = []
}

module.exports = Page
