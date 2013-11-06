// external dependencies
var natural = require('natural')
  , inflector = new natural.NounInflector()
  , _ = require('lodash')

// local dependencies
var site = require('../lib/site')
  , data = site.templateData

// takes query parameters and returns
// a list of posts that match
function Query(params) {

  var typePlural = inflector.pluralize(params.type)
    , posts = data[typePlural].slice()
    , sortBy
    , order

  debugger

  // filter posts by any passed taxonomies
  _.each(params, function(taxonomyValue, taxonomyType) {
    var taxonomyTypePlural = inflector.pluralize(taxonomyType)
    if (site._taxonomies[taxonomyTypePlural]) {
      posts = _.filter(posts, function(post) {
        return _.contains(post[taxonomyTypePlural], taxonomyValue)
      })
    }
  })

  // if posts is empty, exit early
  if (!posts.length) return []

  // use the passed value for `sortBy` if present
  // otherwise use `date` if it exists, if not use `title`
  sortBy = params.sortBy
    ? params.sortBy
    : (posts[0].date ? 'date' : 'title')

  // use the passed value for `order` if present
  // otherwise default to `ascending` unless we're sorting by `date`
  order = params.order || (sortBy == 'date' ? 'descending' : 'ascending')

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

  // if we're paginating, alter the posts object for this page
  // if (this.page.pagination) {
  //   var limit = this.page.pagination.limit
  //     , pagenum = this.page.pagination.pagenum
  //   posts = posts.slice(limit * (pagenum - 1),  limit * pagenum)
  // }

  this.params = params
  this.posts = posts

}

module.exports = Query

