var fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , Handlebars = require('handlebars')
  , site = require('./site')
  , File = require('./file')
  , permalink = require('./permalink')
  , _ = require('lodash')


function Page(filename) {

  this.file = File.getOrCreate(filename)
  this.filename = filename
  this.extension = path.extname(filename)
  this.data = this.file.data
  this.content = this.file.content
  this.destination = path.join(site.config.destination, this.data.permalink || filename)

  if (this.file.data) {
    this.render()
    this.write()
  } else {
    this.copy()
  }
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

  mkdirp.sync(path.dirname(this.destination))
  fs.writeFileSync(this.destination, this.content)

  console.log("Writing " + this.file.name + " to " + this.destination)
  site.emit("afterWrite", this)
}

module.exports = Page
