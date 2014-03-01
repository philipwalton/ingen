var _ = require('lodash-node/modern')
var natural = require('natural')
var inflector = new natural.NounInflector()

// TODO: consider passing the taxonomy types to the constructor
function PostManager(taxonomyTypes) {
  this.posts = []
  this.taxonomyTypes = taxonomyTypes
  this.taxonomies = {}
  _.each(this.taxonomyTypes, function(taxonomyType) {
    this.taxonomies[taxonomyType] = {}
  }, this)
}

PostManager.prototype.add = function(post) {
  this.posts.push(post)
  _.each(this.taxonomyTypes, function(taxonomyType) {
    var taxonomyTypePlural = inflector.pluralize(taxonomyType)
    if (post[taxonomyTypePlural]) {
      _.each(post[taxonomyTypePlural], function(taxonomyValue) {

        this.taxonomies[taxonomyType][taxonomyValue]
          || (this.taxonomies[taxonomyType][taxonomyValue] = [])
        this.taxonomies[taxonomyType].posts.push(post)

      }, this)
    }
  }, this)

}

PostManager.prototype.all = function() {
  return posts
}

PostManager.prototype.each = function(cb) {
  _.each(this.posts, cb)
}

PostManager.prototype.reset = function() {
  this.posts = []
}

module.exports = PostManager
