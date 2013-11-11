// external dependencies
var Handlebars = require('handlebars')
  , natural = require('natural')
  , inflector = new natural.NounInflector()
  , _ = require('lodash')

// local dependencies
var site = require('../lib/site')
  , Query = require('../lib/query')
  , config = site.config
  , data = site.templateData

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}

_.each(config.postTypes, function(type) {

  Handlebars.registerHelper('each' + capitalize(type), function(options) {


    var params = _.assign({type: type}, options.hash)
      , query = new Query(params)

    // render the result
    return _.map(query.run(), function(post) {
      return options.fn(post.toTemplateObject())
    }).join('')

  });

})


Handlebars.registerHelper('query', function(options) {
  var query = new Query(this.page.query)

  // render the result
  return _.map(query.run(), function(post) {
    return options.fn(post.toTemplateObject())
  }).join('')

})
