var _ = require('private-parts').scope()
var natural = require('natural');
var inflector = new natural.NounInflector();

function PostManager(taxonomyTypes) {

  // build the taxonomies categorization store
  var taxonomies = {};
  for (var i = 0, taxType; taxType = taxonomyTypes[i]; i++) {
    taxonomies[taxType] = {};
  }

  _(this).posts = [];
  _(this).taxonomyTypes = taxonomyTypes
  _(this).taxonomies = taxonomies
}

PostManager.prototype.add = function(post) {

  _(this).posts.push(post);

  for (var i = 0, taxType; taxType = _(this).taxonomyTypes[i]; i++) {
    var taxTypePlural = inflector.pluralize(taxType);
    if (post[taxTypePlural]) {
      for (var j = 0, taxValue; taxValue = post[taxTypePlural][j]; j++) {
        // store a local reference to for code clarity
        var thisTaxType = _(this).taxonomies[taxType];
        // add the post to this taxonomy categorization for easy access later
        thisTaxType[taxValue] || (thisTaxType[taxValue] = []);
        thisTaxType[taxValue].push(post);
      }
    }
  }
};

PostManager.prototype.all = function() {
  return _(this).posts;
};

PostManager.prototype.getByTaxonomy = function(type, value) {
  return _(this).taxonomies[type][value];
};

module.exports = PostManager;
