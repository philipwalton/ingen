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

  // Recursively merge this file's data with its parents
  // all the way up the layout chain.
  this._mergeDataWithParent();

  // Add this file to the store.
  files[this.filename] = this;
}


File.prototype._mergeDataWithParent = function() {
  var layout = this._getLayoutFile();

  if (layout && layout.data) {
    // for query data we want to merge the values with any layout values
    if (this.data.query && layout.data.query) {
      _.merge(this.data.query, layout.data.query)
    }
    // all other propertyes can simply use _.defaults
    _.defaults(this.data, layout.data)
  }
}

File.prototype._getLayoutFile = function() {
  if (!this.data || !this.data.layout) return;

  if (!this.config) {
    debugger
  }

  var layoutFilepath = this.config.layoutsDirectory + '/'
    + this.data.layout + '.html';

  return File.getOrCreate(layoutFilepath, this.config);
};


File.getOrCreate = function(filename, config) {
  var file = files[filename];
  return (file && file.config == config)
    ? file
    : new File(filename, config);
};


function parseFile(filename) {

  if (filename == '_layouts/file-parent.html') {
    debugger
  }

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
