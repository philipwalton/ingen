var fs = require('fs-extra')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , Handlebars = require('handlebars')
  , site = require('./site')
  , File = require('./file')
  , Permalink = require('./permalink')
  , _ = require('lodash')


function Page(file, type) {
  // assign all file data properties to the page for convenience
  _.assign(this, file.data)

  this.file = file
  this.type = type
  this.filename = file.filename
  this.content = file.content
  this.extension = path.extname(this.filename)
  this.permalink = Permalink.getFromPage(this).toString()
}

Page.prototype.render = function() {
  var file = this.file
    , data = { site: site.data, page: this.data, content: this.content }

  site.emit("beforeRenderFile", this)

  // The first time through we compile from the page content
  // (rather than file.content) because a plugin may have altered it
  this.content = Handlebars.compile(this.content)(data)

  site.emit("afterRenderFile", this)

  // looks like marked is converting `'` to `&#39;` which is messing
  // up handlebars so we have to do the handlebars processing of the
  // template first, then the markdown transformations, then the
  // handlebars processing of the rendered page
  site.emit("transformFile", this)

  site.emit("beforeRenderPage")

  while (file = file.parent) {
    data.content = this.content
    this.content = Handlebars.compile(file.content)(data)
  }

  site.emit("afterRenderPage", this)
  console.log("Rendering " + this.filename)
}

Page.prototype.write = function() {

  var destination = path.join(site.config.destination, this.permalink)

  site.emit("beforeWrite", this)

  // if destination is a folder, create an index.html
  if (!path.extname(destination)) {
    destination = path.join(destination, "index.html")
  }

  fs.outputFileSync(destination, this.content)

  console.log("Writing " + this.filename + " to " + destination)
  site.emit("afterWrite", this)
}

module.exports = Page
