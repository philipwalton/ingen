// external dependencies
var natural = require('natural')
  , inflector = new natural.NounInflector()
  , pluralize = inflector.pluralize.bind(inflector)
  , moment = require('moment')
  , _ = require('lodash')

// local dependencies
var site = require('../lib/site')

// anything that isn't a query property is
// assumed to be a taxonomy name
var queryProperties = [
  'type',
  'order',
  'sortBy',
  'limit',
  'page'
]

// takes query parameters and returns
// a list of posts that match
function Query(params, posts) {
  this.params = params || {}
  this.posts = posts || this.posts || site._posts
}

Query.prototype.run = function() {
  return this
    .filter()
    .sort()
    .order()
    .limit()
    .posts
};

Query.prototype.filter = function() {
  var params = this.params

  this.posts = _.filter(this.posts, function(post) {
    var returnValue = true
      , taxonomyParams = _.omit(params, queryProperties)

    // filter by type
    if (params.type && params.type !== post.type) return false

    // filter by taxonomy
    _.each(taxonomyParams, function(taxonomyValue, taxonomyType) {
      // if any of the taxonomies don't match, set returnValue to false
      if (!_.contains(post[pluralize(taxonomyType)], taxonomyValue)) {
        returnValue = false
      }
    })

    return returnValue
  })

  return this
}

Query.prototype.sort = function() {
  // Use the passed value for `sortBy` if present
  // otherwise use `date` if it exists.
  // If these posts don't contains dates, use `title`
  var postsHaveDates = !!(this.posts[0] && this.posts[0].date)
    , sortBy = this.params.sortBy || (postsHaveDates ? 'date' : 'title')

  this.params.sortBy = sortBy

  this.posts.sort(function(a,b) {
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

  return this
}

Query.prototype.order = function() {
  // use the passed value for `order` if present
  // otherwise default to ascending unless we're sorting by `date`
  // in which case the norm is to sort in descending order
  var order = this.params.order || (this.params.sortBy == 'date' ? 'desc' : 'asc')
  this.params.order = order

  // reverse the order for descending
  if (order.toLowerCase().indexOf('desc') === 0) this.posts.reverse()

  return this
}

Query.prototype.limit = function() {
  var page = this.params.page || 1
    , limit = this.params.limit

  if (limit) {
    var start = (page - 1) * limit
      , end = start + limit
    this.posts = this.posts.slice(start, end)
  }
  return this
}

module.exports = Query