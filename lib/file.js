var fs = require('fs-extra');
var path = require('path');
var os = require('os');
var _ = require('lodash-node/modern');

// TODO: add caching and cache invalidation so files aren't read
// twice unless we're previewing locally and the file actually changed


// Store the existing files.
var files = {};


function File(data, content, config) {

  // Argument shifting.
  // If data is a string then it's a path to a file.
  if (typeof data == 'string') {
    var parsed = parseFile(data);
    this.filename = data
    this.content = parsed.content;
    this.data = parsed.data;
    this.config = content;
  } else {
    this.data = data
    this.content = content
    this.config = config;
  }

  // Recursively merge this file's data all the way up the layout chain.
  this._storeLayout();
  this._mergeDataWithLayout();

  // Add this file to the store
  if (this.filename) files[this.filename] = this;
}


File.prototype._mergeDataWithLayout = function() {
  if (this.layout && this.layout.data) {
    // for query data we want to merge the values with any layout values
    if (this.data.query && this.layout.data.query) {
      _.merge(this.data.query, this.layout.data.query)
    }
    // all other propertyes can simply use _.defaults
    _.defaults(this.data, this.layout.data)
  }
}

File.prototype._storeLayout = function() {
  if (this.data && this.data.layout) {
    var layoutFilepath = this.config.layoutsDirectory + '/'
      + this.data.layout + '.html';

    this.layout = File.getOrCreateFromFile(layoutFilepath, this.config);
  }
};


File.getOrCreateFromFile = function(filename, config) {
  var file = files[filename];
  return (file && file.config == config)
    ? file
    : new File(filename, config);
};


function parseFile(filename) {

  var file = fs.readFileSync(filename, 'utf8');
  var lines = file.split(os.EOL);
  var line = lines.shift();
  var data = '';

  // return false if no file data is found
  if (line != '<!--') {
    return {
      data: null,
      content: file
    }
  }

  while ((line = lines.shift()) != null) {
    if (line != '-->') {
      data += line;
    } else {
      break;
    }
  }

  return {
    data: JSON.parse(data),
    content: lines.join(os.EOL)
  };
};

module.exports = File;
