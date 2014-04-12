var fs = require('fs-extra');
var _ = require('lodash-node/modern');

var config = {

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

config.set = function(overrides) {

  _.assign(this, overrides);

  // make sure certain files are always excluded
  this.excludeFiles = _.union(
    this.excludeFiles,
    [
      '_*',
      '_*/**/*',
      'package.json',
      'node_modules/**/*'
    ]
  );

  // make sure certain directories are never watched
  this.watchExcludes = _.union(
    this.watchExcludes,
    ['node_modules', this.destination]
  );

  return this;
}

module.exports = config;
