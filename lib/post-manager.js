var _ = require('lodash-node/modern')

// TODO: consider passing the taxonomy types to the constructor
function PostManager() {
  this.posts = []
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
