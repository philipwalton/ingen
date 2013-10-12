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


function renderFile(filename, content) {
  var file = getFileData(filename)
    , layout = getFileData('./_layouts/' + file.data.layout + '.html')
    , data = { site: config, page: file.data }

  // add the content if passed from a recursive call
  if (content) data.content = content

  // TODO: add hook to transform content here

  // render this files content before recursing
  data.content = Handlebars.compile(file.content)(data)

  if (layout.data) {
    // recurse
    return renderFile('./_layouts/' + file.data.layout + '.html', data.content)
  } else {
    // return
    return Handlebars.compile(layout.content)(data)
  }
}


function renderMarkdownFile(filename, content) {
  var file = getFileData(filename)
    , layout = getFileData('./_layouts/' + file.data.layout + '.html')
    , data = { site: config, page: file.data }

  // add the content if passed from a recursive call
  if (content) data.content = content

  // TODO: add hook to transform content here
  // instead of just manually doing this
  file.content = marked(file.content)

  // render this files content before recursing
  data.content = Handlebars.compile(file.content)(data)

  if (layout.data) {
    // recurse
    return renderFile('./_layouts/' + file.data.layout + '.html', data.content)
  } else {
    // return
    return Handlebars.compile(layout.content)(data)
  }
}


function getFileData(filename) {
  var file = fs.readFileSync(filename, 'utf8')
  if (file.indexOf("<!--") !== 0) {
    return {
      data: null,
      content: file
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
        content: lines.join(os.EOL)
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

  var data = getFileData(filename).data
    , content

  if (!data) {
    this.copy()
  } else {
    content = path.extname(filename) == ".md"
      ? renderMarkdownFile(filename)
      : renderFile(filename)

    if (data.url) {
      this.destination = path.join('./_site', data.url)
    }

    mkdirp.sync(path.dirname(this.destination))
    fs.writeFileSync(this.destination, content)
    console.log("Transforming " + this.source + " to " + this.destination)
  }

}

File.prototype.copy = function() {
  mkdirp.sync(path.dirname(this.destination))
  fs.writeFileSync(this.destination, fs.readFileSync(this.source))
  console.log("Copying " + this.source + " to " + this.destination)
}

module.exports = File
