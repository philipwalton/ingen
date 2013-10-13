var fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , Handlebars = require('handlebars')
  , site = require('./site')
  , file = require('./file')
  , _ = require('lodash')

function renderRecursive(filename, data) {

  var layout = file.getData(filename).layout
    , layoutFile = '_layouts/' + layout  + '.html'
    , layoutData = file.getData(layoutFile)
    , layoutContent = file.getContent(layoutFile)

  // render this files content before recursing
  data.content = Handlebars.compile(data.content)(data)

  if (layoutData) {
    // recurse
    return renderRecursive(layoutFile, data)
  } else {
    // return
    return Handlebars.compile(layoutContent)(data)
  }
}

function Page(filename) {

  this.filename = filename
  this.extension = path.extname(this.filename)

  if (file.hasData(filename)) {
    this.data = file.getData(filename)
    this.content = file.getContent(filename)
    this.transform()
    this.render()
  } else {
    this.copy()
  }
}

Page.prototype.copy = function() {
  this.destination = path.join('_site', this.filename)

  mkdirp.sync(path.dirname(this.destination))
  fs.writeFileSync(this.destination, fs.readFileSync(this.filename))

  console.log("Copying " + this.filename + " to " + this.destination)
}

Page.prototype.render = function() {
  this.destination = path.join('_site', this.data.url || this.filename)
  mkdirp.sync(path.dirname(this.destination))

  fs.writeFileSync(
    this.destination,
    renderRecursive(this.filename, {
      site: site.config,
      page: this.data,
      content: this.content
    })
  )

  console.log("Rendering " + this.filename + " to " + this.destination)
};

Page.prototype.transform = function() {

  site.emit("beforeTransform", this)
  site.emit("transform", this)
  site.emit("afterTransform", this)

  console.log("Transforming " + this.filename)
}

module.exports = Page
