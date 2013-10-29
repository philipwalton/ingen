var fs = require('fs-extra')
  , path = require('path')
  , os = require('os')
  , _ = require('lodash')


var readFile = _.memoize(function(filename) {
  return fs.readFileSync(filename, 'utf8')
})

var processFile = _.memoize(function(filename) {

  var file = readFile(filename)
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

  return {
    data: parseJSON(data, filename),
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

function hasFileData(filename) {
  return !!processFile(filename)
}

function getFileData(filename) {
  return processFile(filename).data
}

function getFileContent(filename) {
  return hasFileData(filename)
    ? processFile(filename).content
    : readFile(filename)
}

// create a file store cache
var files = []

function File(filename) {
  this.filename = filename
  this.content = getFileContent(filename)
  this.data = getFileData(filename)

  File.add(this)
}

File.add = function(file) {
  files = _.union(files, [file])
}

File.getOrCreate = function(filename) {
  var file = _.find(files, function(f) {
    return f == file
  })
  return file || new File(filename)
}

module.exports = File
