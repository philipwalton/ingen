var fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , Handlebars = require('handlebars')
  , site = require('./site')
  , File = require('./file')
  , _ = require('lodash')


function Page(filename) {

  this.file = File.getOrCreate(filename)
  this.filename = filename
  this.extension = path.extname(filename)
  this.destination = getDestinationPath(this.file)
  this.content = this.file.content

  if (this.file.data) {
    this.render()
    this.write()
  } else {
    this.copy()
  }
}

Page.prototype.copy = function() {
  site.emit("beforeCopy", this)

  mkdirp.sync(path.dirname(this.destination))
  // TODO: since we've already read this file, look into way
  // to avoid doing this again. Maybe storing the buffer...
  fs.writeFileSync(this.destination, fs.readFileSync(this.filename))

  site.emit("afterCopy", this)
  console.log("Copying " + this.file.name + " to " + this.destination)
}

Page.prototype.render = function() {
  var file = this.file
    , data = { site: site.config, page: this.file.data, content: this.content }

  site.emit("beforeRender", this)

  // The first time through we compile from the page content
  // (rather than file.content) because a plugin may have altered it
  this.content = Handlebars.compile(this.content)(data)

  while (file = file.parent) {
    data.content = this.content
    this.content = Handlebars.compile(file.content)(data)
  }

  site.emit("afterRender", this)
  console.log("Rendering " + this.file.name)
}

Page.prototype.write = function() {

  site.emit("beforeWrite", this)

  mkdirp.sync(path.dirname(this.destination))
  fs.writeFileSync(this.destination, this.content)

  console.log("Writing " + this.file.name + " to " + this.destination)
  site.emit("afterWrite", this)
}

function getDestinationPath(file) {
  var dest = file.data && file.data.permalink
    ? file.data.permalink
    : file.name
  return path.join(site.config.destination, dest)
}

module.exports = Page
