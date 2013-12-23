// external dependencies
var Handlebars = require('handlebars')
var natural = require('natural')
var inflector = new natural.NounInflector()
var _ = require('lodash')

// local dependencies
var site = require('../../lib/site')
var Query = require('../../lib/query')
var Post = require('../../lib/post')
var config = require('../../lib/config')
var data = site.templateData

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}

function renderQuery(params, options) {
  var query = new Query(params, Post.all())
  return _.map(query.run(), function(post) {
    return options.fn(post)
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
