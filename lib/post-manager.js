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

  for (var i = 0, taxType; taxType = this.taxTypes[i]; i++) {
    var taxTypePlural = inflector.pluralize(taxType)
    if (post[taxTypePlural]) {
      for (var j = 0, taxValue; taxValue = post[taxTypePlural][j]; j++) {
        var thisTaxType = this.taxonomies[taxType][taxValue]

        // add the post to this taxonomy categorization for easy access later
        thisTaxType[taxValue] || (thisTaxType[taxValue] = [])
        thisTaxType[taxValue].push(post)
      }
    }

  }
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
