var _ = require('lodash')
var natural = require('natural')
var inflector = new natural.NounInflector()

var Post = require('./post')

// store a map of all taxonomies and their posts
var taxonomies = {}

function Taxonomy(type, value) {
  taxonomies[type] || (taxonomies[type] = {})
  taxonomies[type][value] = this

  this.init(type, value)
}

Taxonomy.prototype.init = function(type, value) {
  this.type = type
  this.value = value
  this.posts = []
}

Taxonomy.prototype.addPost = function(post) {
  this.posts.push(post)
}

Taxonomy.getOrCreate = function(type, value) {
  return taxonomies[type] && taxonomies[type][value]
    ? taxonomies[type][value]
    : new Taxonomy(type, value)
}


Taxonomy.all = function() {
  return taxonomies
}

Taxonomy.each = function(cb) {
  _.each(taxonomies, function(taxonomyValues, taxonomyType) {
    var taxonomyTypePlural = inflector.pluralize(taxonomyType)
    _.each(taxonomyValues, function(taxonomy, taxonomyValue) {
      cb(taxonomyValue, taxonomyType, taxonomyTypePlural)
    })
  })
}

Taxonomy.reset = function() {
  taxonomies = {}
}

module.exports = Taxonomy
