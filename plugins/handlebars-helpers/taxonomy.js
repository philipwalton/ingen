// external dependencies
var Handlebars = require('handlebars')
var natural = require('natural')
var inflector = new natural.NounInflector()
var _ = require('lodash')

// local dependencies
var config = require('../../lib/config')
var postTypes = config.postTypes
var taxonomyTypes = config.taxonomyTypes
var Taxonomy = require('../../lib/taxonomy')

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}

function camelize() {
  return arguments[0] + _.map(_.toArray(arguments).slice(1), capitalize).join('')
}

_.each(postTypes, function(postType) {
  _.each(taxonomyTypes, function(taxonomyType) {
    var taxonomyTypePlural = inflector.pluralize(taxonomyType)
    var postTypePlural = inflector.pluralize(postType)
    var helperName = camelize('if', postType, 'Has', taxonomyType)

    // See if a the post context contains the given taxonomy
    //
    // Given the post type `article` and the taxonomy types `tag` and `author`,
    // the following helpers will be generated:
    // - {{ifArticleHasAuthor <value>}}
    // - {{ifArticleHasTag <value>}}
    Handlebars.registerHelper(
      camelize('if', postType, 'Has', taxonomyType),
      function(value, options) {
        return this[taxonomyTypePlural] && _.contains(this[taxonomyTypePlural], value)
          ? options.fn(this)
          : options.inverse(this)
      }
    )

    // Get the post count for a given taxonomy
    //
    // Given the post type `article` and the taxonomy types `tag` and `author`,
    // the following helpers will be generated:
    // - {{countArticlesWithAuthor <value>}}
    // - {{countArticlesWithTag <value>}}
    Handlebars.registerHelper(
      camelize('count', postTypePlural, 'With', taxonomyType),
      function(value, options) {

        return Taxonomy.all()[taxonomyType][value].posts.length
      }
    )

    // Iterate over each taxonomy of a given type
    //
    // Given the taxonomy types `tag` and `author`,
    // the following helpers will be generated:
    // - {{#eachAuthor}}
    // - {{#eachTag}}
    Handlebars.registerHelper(
      camelize('each', taxonomyType),
      function(options) {
        var taxonomyValues = Taxonomy.all()[taxonomyType]
        return _.map(_.keys(taxonomyValues).sort(), function(value) {
          return options.fn(taxonomyValues[value])
        }).join('')
      }
    )
  })
})


