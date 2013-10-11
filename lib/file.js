var fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , os = require('os')
  , Handlebars = require('handlebars')
  , marked = require('marked')
  , hljs = require("highlight.js")
  , config = JSON.parse(fs.readFileSync('./_config.json', 'utf8'))
  , _ = require('lodash')

marked.setOptions({
  highlight: function(code, lang) {
    return lang
      ? hljs.highlight(lang, code).value
      : hljs.highlightAuto(code).value
  }
})


function renderFile(filename) {
  var file = getFileData(filename)
    , layout = fs.readFileSync('./_layouts/default.html', 'utf8')
    , data = { site: config, page: file.data }
  return Handlebars.compile(layout)(_.assign(data, {
    content: Handlebars.compile(file.contents)(data)
  }))
}

function renderMarkdownFile(filename) {
  var file = getFileData(filename)
    , contents = marked(file.contents)
    , layout = fs.readFileSync('./_layouts/default.html', 'utf8')
    , data = { site: config, page: file.data }
  return Handlebars.compile(layout)(_.assign(data, {
    content: Handlebars.compile(contents)(data)
  }))
}

function getFileData(filename) {
  var file = fs.readFileSync(filename, 'utf8')
  if (file.indexOf("<!--") !== 0) {
    return {
      data: null,
      contents: file
    }
  }
  var data = ''
    , lines = file.split(os.EOL).slice(1)
    , line
  while ((line = lines.shift()) != null) {
    if (line != '-->') {
      data += line
    } else {
      return {
        data: JSON.parse(data),
        contents: lines.join(os.EOL)
      }
    }
  }
}

// console.log(renderFile('./index.html'))
// console.log(renderMarkdownFile('./test.md'))


function File(filename) {
  this.source = filename
  this.extension = path.extname(this.source)
  this.destination = path.join('./_site', this.source)

  var data = getFileData(filename)
    , contents

  if (!data.data) {
    this.copy()
  } else {
    contents = path.extname(filename) == ".md"
      ? renderMarkdownFile(filename)
      : renderFile(filename)
    mkdirp.sync(path.dirname(this.destination))
    fs.writeFileSync(this.destination, contents)
    console.log("Transforming " + this.source + " to " + this.destination)
  }

}

File.prototype.copy = function() {
  mkdirp.sync(path.dirname(this.destination))
  fs.writeFileSync(this.destination, fs.readFileSync(this.source))
  console.log("Copying " + this.source + " to " + this.destination)
}

module.exports = File
