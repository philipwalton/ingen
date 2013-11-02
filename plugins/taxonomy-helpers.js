// external dependencies
var Handlebars = require('handlebars')
  , natural = require('natural')
  , inflector = new natural.NounInflector()
  , _ = require('lodash')

// local dependencies
var site = require('../lib/site')
  , postTypes = site.config.postTypes
  , taxonomies = site.config.taxonomies


function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}

function camelize() {
  return arguments[0] + [].slice.call(arguments, 1).map(capitalize).join('')
}

// Loop through each post type and taxonomy and create helpers
// to aid in determining if a given post contains the given taxonomy
// For example, given the post types: `article`, `page`
// and the taxonomies: `tag`, `author`, the following helpers
// will be generated:
// - {{#ifArticleHasAuthor <type>}}
// - {{#ifArticleHasTag <type>}}
// - {{#ifPageHasAuthor <type>}}
// - {{#ifPageHasTag <type>}}

postTypes.forEach(function(type) {
  taxonomies.forEach(function(taxonomy) {
    var taxonomyPlural = inflector.pluralize(taxonomy)
      , helperName = camelize('if', type, 'Has', taxonomy)
    Handlebars.registerHelper(helperName, function(value, options) {
      return this[taxonomyPlural] && _.contains(this[taxonomyPlural], value)
        ? options.fn(this)
        : options.inverse(this)
    })
  })
})
