var fs = require('fs-extra')
var path = require('path')
var util = require('util')
var mkdirp = require('mkdirp')
var natural = require('natural')
var inflector = new natural.NounInflector()
var Handlebars = require('handlebars')
var _ = require('lodash-node/modern')

var templateData = require('./template-data')
var config = require('./config')
var events = require('./events')
var File = require('./file')
var Post = require('./post')
var Permalink = require('./permalink')
var Query = require('./query')

// store a collection of all pages
var pages = []

function Page(obj) {
  pages.push(this)

  this.init(obj)
}

// Page extends Post
util.inherits(Page, Post)

Page.prototype.init = function(obj) {
  // If the Page is being created from a post object just do a shallow copy
  // and be done. Don't call the same methods twice.
  if (obj instanceof Post) {
    _.defaults(this, obj)
  }
  else {
    Page.super_.prototype.init.call(this, obj)
  }
}

Page.prototype.paginate = function() {

  // only paginate if there's a query
  if (!this.query) return

  // only paginate a page the first time through
  // (i.e., when making page/2/ don't do this logic again)
  if (this.query.page > 1) return

  var limit = this.query.limit
  var unpagedQuery = new Query(_.omit(this.query, 'limit', 'page'), Post.all())
  var postCount = unpagedQuery.run().length
  var totalPages = Math.ceil(postCount / limit)
  var page = 1
  var pages = [this]
  var obj

  // create additional pages required for pagination
  while (++page <= totalPages) {
    obj = _.cloneDeep(this)
    obj.query.page = page
    obj.permalink = this.permalink.clone().append("page/" + page)
    pages.push(new Page(obj))
  }

  // add pagination data to the newly created pages
  if (totalPages > 1) {
    _.each(pages, function(page, i) {
      page.paginated = true
      if (i == 0) {
        page.prevPage = false
        page.nextPage = pages[i + 1]
      }
      else if (i == totalPages - 1) {
        page.nextPage = false
        page.prevPage = pages[i - 1]
      }
      else {
        page.nextPage = pages[i + 1]
        page.prevPage = pages[i - 1]
      }
    })
  }

}

Page.prototype.render = function() {

  Page.super_.prototype.render.call(this)

  events.emit("beforeRenderPage", this)

  // recursively render the page content up the layout chain
  this.content = (function fn(layout, content, data) {
    layout = File.getOrCreate('_layouts/' + layout + '.html')
    data.content = content
    content = Handlebars.compile(layout.content)(data)
    return layout.data && layout.data.layout
      ? fn(layout.data.layout, content, data)
      : content
  }(this.layout, this.content, this._templateData()))

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

Page.prototype._templateData = function() {
  return _.assign({}, templateData, {
    page: this,
    content: this.content
  })
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
