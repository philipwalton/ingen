var fs = require('fs-extra');
var assign = require('lodash-node/modern').assign;
var union = require('lodash-node/modern').union;

var defaults = {

  // build options
  source: '.',
  destination: '_site',
  excludeFiles: [],
  includeFiles: [], // e.g. .htaccess

  // timezone
  timezone: 'America/Los_Angeles',

  // environment options
  env: 'production',

  // template options
  partialsDirectory: '_partials',
  layoutsDirectory: '_layouts',

  // plugin options
  pluginDirectory: '_plugins',
  excludePlugins: [],

  // post options
  postTypes: ['post'],
  excerptLength: 40,
  includeDrafts: false,

  // page options
  permalink: '/:title',

  // taxonomy options
  taxonomyTypes: [],

  // serve options
  port: 4000,
  watch: false,
  watchExcludes: []
};

function Config(options) {
  assign(this, defaults);
  this.set(options || {});
}

Config.prototype.set = function(options) {

  assign(this, options);

  // make sure certain files are always excluded
  this.excludeFiles = union(
    this.excludeFiles,
    [
      '.*',
      '_*',
      '_*/**/*',
      'package.json',
      'bower_components',
      'node_modules'
    ]
  );

  // make sure certain directories are never watched
  this.watchExcludes = union(
    this.watchExcludes,
    ['node_modules', this.destination]
  );
}

module.exports = Config
