var fs = require('fs')
  , os = require('os')
  , memoize = require('lodash').memoize


var readFile = memoize(function(filename) {
  return fs.readFileSync(filename, 'utf8')
})

var processFile = memoize(function(filename) {

  var file = readFile(filename)

  // return false if no file data is found
  if (file.indexOf("<!--") !== 0) return false

  var data = ''
    , lines = file.split(os.EOL).slice(1)
    , line

  while ((line = lines.shift()) != null) {
    if (line != '-->') {
      data += line
    } else {
      break
    }
  }

  try {
    data = JSON.parse(data)
  } catch(e) {
    throw new Error('Unable to parse JSON data from ' + filename)
  }

  return {
    data: data,
    content: lines.join(os.EOL)
  }
})

module.exports = {

  hasData: function(filename) {
    return !!processFile(filename)
  },

  getData: function(filename) {
    return processFile(filename).data
  },

  getContent: function(filename) {
    return this.hasData(filename)
      ? processFile(filename).content
      : readFile(filename)
  }

}
