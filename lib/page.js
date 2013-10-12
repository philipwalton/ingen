var fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , os = require('os')
  , Handlebars = require('handlebars')
  , marked = require('marked')
  , hljs = require("highlight.js")
  , config = JSON.parse(fs.readFileSync('./_config.json', 'utf8'))
  , _ = require('lodash')
  , site = require('./site')

marked.setOptions({
  highlight: function(code, lang) {
    return lang
      ? hljs.highlight(lang, code).value
      : hljs.highlightAuto(code).value
  }
})

function transformContent(content, extension) {

}

function renderRecursive(filename, data) {
  var file = getFileData(filename)
    , layout = getFileData('./_layouts/' + file.data.layout + '.html')

  // render this files content before recursing
  data.content = Handlebars.compile(file.content)(data)

  if (layout.data) {
    // recurse
    return renderRecursive('./_layouts/' + file.data.layout + '.html', data)
  } else {
    // return
    return Handlebars.compile(layout.content)(data)
  }
}

function Page(filename) {

  var fileData = getFileData(filename)

  this.data = fileData.data
  this.rawContent = fileData.content
  this.source = filename
  this.extension = path.extname(this.source)
  this.destination = path.join('./_site', this.source)

  // only transform files with JSON data
  // all other files are copied as-is
  if (this.data) {
    this.transform()
  } else {
    this.copy()
  }
}

Page.prototype.copy = function() {
  mkdirp.sync(path.dirname(this.destination))
  fs.writeFileSync(this.destination, fs.readFileSync(this.source))
  console.log("Copying " + this.source + " to " + this.destination)
}

Page.prototype.transform = function() {
  if (this.data.url) {
    this.destination = path.join('./_site', this.data.url)
  }

  var data = { site: config, page: this.data, content: this.rawContent }
  var content = renderRecursive(this.source, data)

  mkdirp.sync(path.dirname(this.destination))
  fs.writeFileSync(this.destination, content)
  console.log("Transforming " + this.source + " to " + this.destination)
}

module.exports = Page
