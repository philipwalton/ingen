// external dependencies
var natural = require('natural')
var inflector = new natural.NounInflector()
var _ = require('lodash-node/modern')

module.exports = function() {

  var site = this

  var config = this.config
  var Query = this.Query
  var Post = this.Post
  var Handlebars = this.Handlebars

  function capitalize(word) {
    return word[0].toUpperCase() + word.slice(1)
  }

  function renderQuery(params, options) {
    var query = new Query(params, site.posts.all())
    return _.map(query.run(), function(post) {
      return options.fn(post);
    }).join('');
  }

  _.each(config.postTypes, function(type) {
    Handlebars.registerHelper('each' + capitalize(type), function(options) {
      var params = _.assign({type: type}, options.hash)
      return renderQuery(params, options)
    });
  })

  Handlebars.registerHelper('query', function(options) {
    return renderQuery(this.query, options)
  })

}
