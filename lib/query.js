// external dependencies
var natural = require('natural')
  , inflector = new natural.NounInflector()
  , pluralize = inflector.pluralize.bind(inflector)
  , moment = require('moment')
  , _ = require('lodash')

// local dependencies
var site = require('../lib/site')

// takes query parameters and returns
// a list of posts that match
function Query(params) {
  this.params = params || {}
  this.result = []

  // perform the query
  this.filterByType()
  this.filterByTaxonomy()
  this.sort()
  this.order()
}

Query.prototype.filterByType = function() {
  var posts = site._posts
    , type = this.params.type
    , typePlural = pluralize(type)

  if (type && posts[typePlural]) {
    this.result = posts[typePlural].slice()
  }
  else {
    _.each(posts, function(typePlural) {
      this.result = this.result.concat(posts[typePlural])
    })
  }
}

Query.prototype.filterByTaxonomy = function() {
  var taxonomyParams = _.pick(this.params, site.config.taxonomyTypes)

  this.result = _.filter(this.result, function(post) {
    // return true if any of the taxonomy key/value pairs are found in the post
    return _.some(taxonomyParams, function(taxonomyValue, taxonomyKey) {
      return _.contains(post[pluralize(taxonomyKey)], taxonomyValue)
    })
  })
}

Query.prototype.sort = function() {
  // Use the passed value for `sortBy` if present
  // otherwise use `date` if it exists.
  // If these posts don't contains dates, use `title`
  var sortBy = this.params.sortBy || (this.result[0].date ? 'date' : 'title')
  this.params.sortBy = sortBy

  this.result.sort(function(a,b) {
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
}

Query.prototype.order = function() {
  // use the passed value for `order` if present
  // otherwise default to ascending unless we're sorting by `date`
  // in which case the norm is to sort in descending order
  var order = this.params.order || (this.params.sortBy == 'date' ? 'desc' : 'asc')
  this.params.order = order

  // reverse the order for descending
  if (order.toLowerCase().indexOf('desc') === 0) this.result.reverse()
}

module.exports = Query
