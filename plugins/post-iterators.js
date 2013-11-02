// external dependencies
var Handlebars = require('handlebars')
  , natural = require('natural')
  , inflector = new natural.NounInflector()
  , _ = require('lodash')

// local dependencies
var site = require('../lib/site')
  , config = site.config
  , data = site.templateData

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}

config.postTypes.forEach(function(type) {

  Handlebars.registerHelper('each' + capitalize(type), function(options) {

    var typePlural = inflector.pluralize(type)
      , posts = data[typePlural].slice()
      , sortBy
      , order

    // filter posts by any passed taxonomies
    _.each(options.hash, function(taxonomyValue, taxonomyType) {
      var taxonomyTypePlural = inflector.pluralize(taxonomyType)
      if (site._taxonomies[taxonomyTypePlural]) {
        posts = _.filter(posts, function(post) {
          return _.contains(post[taxonomyTypePlural], taxonomyValue)
        })
      }
    })

    // if posts is empty, exit early with the inverse context
    if (!posts.length) return options.inverse(this)

    // use the passed value for `sortBy` if present
    // otherwise use `date` if it exists, if not use `title`
    sortBy = options.hash.sortBy
      ? options.hash.sortBy
      : (posts[0].date ? 'date' : 'title')

    // use the passed value for `order` if present
    // otherwise default to `ascending` unless we're sorting by `date`
    order = options.hash.order || (sortBy == 'date' ? 'descending' : 'ascending')

    posts.sort(function(a,b) {
      if (sortBy == 'date') {
        return moment(a.date).isBefore(b.date) ? -1 : 1
      }
      else if (typeof a[sortBy] == 'number') {
        return a[sortBy] - b[sortBy]
      }
      else {
        return a[sortBy] < b[sortBy] ? -1 : 1
      }
    })

    // reverse the order for descending
    if (order.toLowerCase().indexOf('desc') === 0) posts.reverse()

    // render the result
    return posts.map(function(context) {
      return options.fn(context)
    }).join('')

  });

})
