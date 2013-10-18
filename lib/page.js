var fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , Handlebars = require('handlebars')
  , site = require('./site')
  , File = require('./file')
  , _ = require('lodash')


function Page(filename) {

  this.file = File.getOrCreate(filename)
  this.destination = getDestinationPath(this.file)

  if (this.file.data) {
    this.transform()
    this.render()
    this.write()
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
  this.content = processTemplate(this.file, {
    site: site.config,
    page: this.file.data,
    content: this.file.content
  })

  console.log("Rendering " + this.file.name)
};

Page.prototype.write = function() {

  site.emit("beforeWrite", this)

  mkdirp.sync(path.dirname(this.destination))
  fs.writeFileSync(this.destination, this.content)

  console.log("Writing " + this.file.name + " to " + this.destination)
}

Page.prototype.transform = function() {

  site.emit("beforeTransform", this)
  site.emit("transform", this)
  site.emit("afterTransform", this)

  console.log("Transforming " + this.file.name)
}

function processTemplate(file, data) {
  if (file.parent) {
    data.content = Handlebars.compile(file.content)(data)
    return renderTemplateDeep(file.parent, data)
  } else {
    return Handlebars.compile(file.content)(data)
  }
}

function getDestinationPath(file) {
  var dest = file.data && file.data.permalink
    ? file.data.permalink
    : file.name
  return path.join(site.config.destination, dest)
}

module.exports = Page
