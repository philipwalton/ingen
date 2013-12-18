// external dependencies
var Handlebars = require('handlebars')
var defaultLimit = require('../../lib/site').config.excerptLength

Handlebars.registerHelper('truncateWords', function(content, options) {
  var wordCount = options.hash.limit || defaultLimit
  return content
    .replace(/(<([^>]+)>)/ig,"")
    .split(' ')
    .slice(0, wordCount)
    .join(' ')
    .trim()
})

