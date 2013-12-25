// external dependencies
var Handlebars = require('handlebars')
var natural = require('natural')
var inflector = new natural.NounInflector()
var _ = require('lodash')

// local dependencies
var config = require('../../lib/config')
var postTypes = config.postTypes
var taxonomyTypes = config.taxonomyTypes

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}

function camelize() {
  return arguments[0] + _.map(_.toArray(arguments).slice(1), capitalize).join('')
}

// Loop through each post type and taxonomy and create helpers
// to aid in determining if a given post contains the given taxonomy
// For example, given the post types: `article`, `page`
// and the taxonomyTypes: `tag`, `author`, the following helpers
// will be generated:
// - {{#ifArticleHasAuthor <type>}}
// - {{#ifArticleHasTag <type>}}
// - {{#ifPostHasAuthor <type>}}
// - {{#ifPostHasTag <type>}}

_.each(postTypes, function(type) {
  _.each(taxonomyTypes, function(taxonomyType) {
    var taxonomyTypePlural = inflector.pluralize(taxonomyType)
    var helperName = camelize('if', type, 'Has', taxonomyType)
    Handlebars.registerHelper(helperName, function(value, options) {
      return this[taxonomyTypePlural] && _.contains(this[taxonomyTypePlural], value)
        ? options.fn(this)
        : options.inverse(this)
    })
  })
})
