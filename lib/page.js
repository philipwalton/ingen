var fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , os = require('os')
  , Handlebars = require('handlebars')
  , marked = require('marked')
  , hljs = require("highlight.js")
  , config = JSON.parse(fs.readFileSync('./_config.json', 'utf8'))
  , site = require('./site')
  , file = require('./file')
  , _ = require('lodash')

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

  var fileData = file.getData(filename)
    , fileContent = file.getContent(filename)
    , layout = './_layouts/' + fileData.layout + '.html'
    , layoutData = file.getData(layout)
    , layoutContent = file.getContent(layout)

  // render this files content before recursing
  data.content = Handlebars.compile(fileContent)(data)

  if (layoutData) {
    // recurse
    return renderRecursive(layout, data)
  } else {
    // return
    return Handlebars.compile(layoutContent)(data)
  }
}

function Page(filename) {

  this.source = filename
  this.extension = path.extname(this.source)
  this.destination = path.join('./_site', this.source)

  if (file.hasData(filename)) {
    this.data = file.getData(filename)
    this.content = file.getContent(filename)
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

  var data = { site: config, page: this.data, content: this.content }
  var content = renderRecursive(this.source, data)

  mkdirp.sync(path.dirname(this.destination))
  fs.writeFileSync(this.destination, content)
  console.log("Transforming " + this.source + " to " + this.destination)
}

module.exports = Page
