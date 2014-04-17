var _ = require('lodash-node/modern');
var natural = require('natural');
var inflector = new natural.NounInflector();

// store a map of all taxonomies and their posts
var taxonomies = {};

function Taxonomy(type, value) {
  taxonomies[type] || (taxonomies[type] = {});
  taxonomies[type][value] = this;

  this.init(type, value);
}

Taxonomy.prototype.init = function(type, value) {
  this.type = type;
  this.typePlural = inflector.pluralize(type);
  this.value = value;
  this.posts = [];
};

Taxonomy.prototype.toString = function() {
  return this.value;
};

Taxonomy.getOrCreate = function(type, value) {
  return taxonomies[type] && taxonomies[type][value]
    ? taxonomies[type][value]
    : new Taxonomy(type, value);
};


Taxonomy.all = function() {
  return taxonomies;
};

Taxonomy.each = function(cb) {
  _.each(taxonomies, function(taxonomyValues) {
    _.each(taxonomyValues, cb);
  });
};

Taxonomy.reset = function() {
  taxonomies = {};
};

module.exports = Taxonomy;
