var natural = require('natural');
var inflector = new natural.NounInflector();

function PostManager(taxonomyTypes) {
  this.posts = [];
  this.taxonomyTypes = taxonomyTypes;
  this.taxonomies = {};

  for (var i = 0, taxType; taxType = this.taxonomyTypes[i]; i++) {
    this.taxonomies[taxType] = {};
  }
}

PostManager.prototype.add = function(post) {
  this.posts.push(post);

  for (var i = 0, taxType; taxType = this.taxonomyTypes[i]; i++) {
    var taxTypePlural = inflector.pluralize(taxType);
    if (post[taxTypePlural]) {
      for (var j = 0, taxValue; taxValue = post[taxTypePlural][j]; j++) {
        // store a local reference to for code clarity
        var thisTaxType = this.taxonomies[taxType];
        // add the post to this taxonomy categorization for easy access later
        thisTaxType[taxValue] || (thisTaxType[taxValue] = []);
        thisTaxType[taxValue].push(post);
      }
    }
  }
};

PostManager.prototype.all = function() {
  return posts;
};

PostManager.prototype.each = function(cb) {
  this.posts.forEach(cb);
};

PostManager.prototype.getByTaxonomy = function(type, value) {
  return this.taxonomies[type][value];
};

PostManager.prototype.eachByTaxonomy = function(type, value, cb) {
  this.taxonomies[type][value].forEach(cb);
};

PostManager.prototype.reset = function() {
  this.posts = [];
};

module.exports = PostManager;
