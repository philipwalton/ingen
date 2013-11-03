var fs = require('fs-extra')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , Handlebars = require('handlebars')
  , natural = require('natural')
  , inflector = new natural.NounInflector()
  , site = require('./site')
  , File = require('./file')
  , Permalink = require('./permalink')
  , _ = require('lodash')


var nonTemplateProperties = [
  "extension",
  "file",
  "filename",
  "layout",
  "type",
]

function Page(obj, type) {

  /*

  What are the main things needed to make a page?
  - content
  - layout
  - permalink

  Pages should have the ability to be created from
  scratch without a file backing them...

  */

  var defaults = {
    layout: 'default'
  }

  if (obj instanceof File) {
    // assign all file data properties to the page for convenience
    _.assign(this, defaults, obj.data)

    this.file = obj
    this.type = type
    this.typePlural = type ? inflector.pluralize(type) : null
    this.filename = obj.filename
    this.content = obj.content
    this.extension = this.filename ? path.extname(this.filename) : '.html'
    this.permalink = Permalink.getFromPage(this).toString()
  }
  else {
    _.assign(this, defaults, obj)
  }

  // store this page on the site object
  if (type) {
    site._posts[this.typePlural].push(this)
  } else {
    site._pages.push(this)
  }

  // if pagination is enabled, create the additional pages
  if (this.pagination) this._paginate()
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

  var destination = path.join(site.config.destination, this.permalink)

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

Page.prototype._paginate = function() {
  if (this.pagination) {
    debugger
    this.pagination.page = (this.pagination.page) || 1

    var amount = this.pagination.amount
    var curPage = this.pagination.page

    if (site._posts[this.pagination.type].length > (curPage * amount)) {
      var obj = _.clone(this)
      obj.permalink = "page/" + (curPage + 1)
      obj.pagination = {
        amount: amount,
        page: curPage + 1,
        type: this.pagination.type
      }

      var p = new Page(obj)
    }
  }
}

module.exports = Page
