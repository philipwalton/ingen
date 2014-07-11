var fs = require('fs-extra');
var path = require('path');
var os = require('os');
var Handlebars = require('handlebars');
var _ = require('lodash-node/modern');

var Permalink = require('./permalink');

// TODO: add caching and cache invalidation so files aren't read
// twice unless we're previewing locally and the file actually changed


// Store the templates that were created from files.
var templateFiles = {};


function Template(data, content, config) {

  // Argument shifting.
  // If data is a string then it's a path to a file.
  if (typeof data == 'string') {
    var parsed = parseTemplateFile(data);
    this.content = parsed.content;
    this.data = parsed.data;
    this.config = content;
    this.filename = data;
  } else {
    this.data = data;
    this.content = content;
    this.config = config;
  }

  this._resolveFormat();
  this._resolveLayout();

  this.data = this.getData();

  // Add this file to the store
  if (this.filename) templateFiles[this.filename] = this;
}

/**
 * Useful for things like pagination.
 */
Template.prototype.clone = function() {
  var clone = new Template(_.cloneDeep(this.data), this.content, this.config);
  if (this.filename) clone.filename = this.filename;
  clone._resolveFormat();
  return clone;
};

Template.prototype.renderContent = function(data) {
  return Handlebars.compile(this.content)(data || this.data);
};

Template.prototype.renderLayout = function(content, data) {

  content = content || this.renderContent();
  data = data || this.getData();

  if (!this.layout) return content;

  // recursively render the template up the layout chain
  return (function fn(layout, content, data) {
    data.content = content;
    content = Handlebars.compile(layout.content)(data);
    layout = layout.layout;
    return layout ? fn(layout, content, data) : content;
  }(this.layout, content, data));
};

Template.prototype.getData = function() {
  return this.layout
    ? _.merge({}, this.layout.getData(), this.data)
    : this.data;
};

/*
Template.prototype._mergeDataWithLayout = function() {
  if (this.layout && this.layout.data) {
    // for query data we want to merge the values with any layout values
    if (this.data.query && this.layout.data.query) {
      _.merge(this.data.query, this.layout.data.query);
    }
    // all other propertyes can simply use _.defaults
    _.defaults(this.data, this.layout.data);
  }
};

Template.prototype.getLayout = function() {
  if (this.data.layout) {
    var layoutFilepath = this.config.layoutsDirectory + '/'
      + this.data.layout + '.html';

    return Template.getOrCreateFromFile(layoutFilepath, this.config);
  }
};
*/

Template.prototype._resolveLayout = function() {
  if (this.data.layout) {
    var layoutFilepath = this.config.layoutsDirectory + '/'
      + this.data.layout + '.html';

    this.layout = Template.getOrCreateFromFile(layoutFilepath, this.config);
  }
};

/*
Template.prototype._storeLayout = function() {
  if (this.data.layout) {
    var layoutFilepath = this.config.layoutsDirectory + '/'
      + this.data.layout + '.html';

    this.layout = Template.getOrCreateFromFile(layoutFilepath, this.config);
  }
};
*/

Template.prototype._resolveFormat = function() {
  var filetype = path.extname(this.filename).substr(1);
  switch (filetype) {
    case 'md':
    case 'markdown':
      this.format = 'markdown';
      break;
    case 'xml':
      this.format = 'xml';
      break;
    default:
      this.format = 'html';
  }
};


Template.getOrCreateFromFile = function(filename, config) {
  var template = templateFiles[filename];
  return (template && template.config == config)
    ? template
    : new Template(filename, config);
};

Template.reset = function() {
  templateFiles = {};
};


function parseTemplateFile(filename) {

  var file = fs.readFileSync(filename, 'utf8');
  var lines = file.split(os.EOL);
  var line = lines.shift();
  var data = '';

  // If no file data is found
  if (line != '<!--') {
    return {
      data: {},
      content: file
    };
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
}

module.exports = Template;
