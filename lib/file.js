var fs = require('fs')
  , path = require('path')
  , os = require('os')
  , site = require('./site')
  , _ = require('lodash')


var readFile = _.memoize(function(name) {
  return fs.readFileSync(name, 'utf8')
})

var processFile = _.memoize(function(name) {

  var file = readFile(name)
    , lines = file.split(os.EOL)
    , line = lines.shift()
    , data = ''

  // return false if no file data is found
  if (line != '<!--') return false

  while ((line = lines.shift()) != null) {
    if (line != '-->') {
      data += line
    } else {
      break
    }
  }

  data = parseJSON(data, name)
  data.filename = name

  if (!data.layout) {
    throw new Error('No layout specified in "' + name + '"')
  }

  return {
    data: data,
    content: lines.join(os.EOL)
  }
})

function parseYAML(content) {
  // TODO: implement this
}

function parseJSON(content, filename) {
  var json
  try {
    json = JSON.parse(content)
  } catch(e) {
    throw new Error('Unable to parse JSON data from "' + filename + '"')
  }
  return json
}

function hasFileData(name) {
  return !!processFile(name)
}

function getFileData(name) {
  return processFile(name).data
}

function getFileContent(name) {
  return hasFileData(name)
    ? processFile(name).content
    : readFile(name)
}

// create a file store cache
var files = []

function File(name) {
  this.name = name
  this.content = getFileContent(name)

  if (hasFileData(name)) {
    this.data = getFileData(name)
    this.parent = File.getOrCreate('_layouts/' + this.data.layout + '.html')
  }

  File.add(this)
}

File.add = function(file) {
  files = _.union(files, [file])
}

File.getOrCreate = function(name) {
  var file = _.find(files, function(f) {
    return f == file
  })
  return file || new File(name)
}

module.exports = File
