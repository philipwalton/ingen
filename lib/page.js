var fs = require('fs-extra')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , Handlebars = require('handlebars')
  , site = require('./site')
  , File = require('./file')
  , Permalink = require('./permalink')
  , _ = require('lodash')


function Page(file, type) {
  // setup page properties
  this.type = type
  this.file = file
  this.filename = file.data.filename
  this.extension = path.extname(this.filename)
  this.data = file.data
  this.content = file.content
  this.permalink = Permalink.getFromPage(this).toString()

  // make the page
  this.render()
  this.write()
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
  console.log("Rendering " + this.file.name)
}

Page.prototype.write = function() {

  site.emit("beforeWrite", this)

  var destination = path.join(site.config.destination, this.permalink)
  // if destination is a folder, create an index.html
  if (!path.extname(destination)) {
    destination = path.join(destination, "index.html")
  }

  fs.outputFileSync(destination, this.content)

  console.log("Writing " + this.filename + " to " + destination)
  site.emit("afterWrite", this)
}

module.exports = Page
