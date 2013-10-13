var fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , Handlebars = require('handlebars')
  , site = require('./site')
  , File = require('./file')
  , _ = require('lodash')

function renderRecursive(file, data) {

  // render this files content before recursing
  data.content = Handlebars.compile(data.content)(data)

  if (file.parent) {
    // recurse
    return renderRecursive(file.parent, data)
  } else {
    // return
    return Handlebars.compile(file.content)(data)
  }
}

function Page(filename) {

  this.file = File.getOrCreate(filename)

  if (this.file.data) {
    this.transform()
    this.render()
  } else {
    this.copy()
  }
}

Page.prototype.copy = function() {
  var destination = path.join('_site', this.file.name)

  mkdirp.sync(path.dirname(destination))
  fs.writeFileSync(destination, fs.readFileSync(this.file.name))

  console.log("Copying " + this.file.name + " to " + destination)
}

Page.prototype.render = function() {
  var destination = path.join('_site', this.file.data.url || this.file.name)
  mkdirp.sync(path.dirname(destination))

  // console.log(this.file)

  fs.writeFileSync(
    destination,
    renderRecursive(this.file, {
      site: site.config,
      page: this.file.data,
      content: this.file.content
    })
  )

  console.log("Rendering " + this.file.name + " to " + destination)
};

Page.prototype.transform = function() {

  site.emit("beforeTransform", this)
  site.emit("transform", this)
  site.emit("afterTransform", this)

  console.log("Transforming " + this.file.name)
}

module.exports = Page
