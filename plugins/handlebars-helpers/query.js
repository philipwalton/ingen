// external dependencies
var Handlebars = require('handlebars')
  , natural = require('natural')
  , inflector = new natural.NounInflector()
  , _ = require('lodash')

// local dependencies
var site = require('../../lib/site')
  , Query = require('../../lib/query')
  , config = site.config
  , data = site.templateData

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}

function renderQuery(params, options) {
  var query = new Query(params)
  return _.map(query.run(), function(post) {
    return options.fn(post.toTemplateObject())
  }).join('')
}

_.each(config.postTypes, function(type) {
  Handlebars.registerHelper('each' + capitalize(type), function(options) {
    var params = _.assign({type: type}, options.hash)
    return renderQuery(params, options)
  });
})

Handlebars.registerHelper('query', function(options) {
  return renderQuery(this.page.query, options)
})
