// external dependencies
var Handlebars = require('handlebars')
var config = require('../../lib/config')
var defaultLimit = config.excerptLength

Handlebars.registerHelper('truncateWords', function(content, options) {
  var wordCount = options.hash.limit || defaultLimit
  return content
    .replace(/(<([^>]+)>)/ig,"")
    .split(' ')
    .slice(0, wordCount)
    .join(' ')
    .trim()
})

