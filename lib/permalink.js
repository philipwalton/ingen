// dependencies
var path = require('path')
  , moment = require('moment')
  , natural = require('natural')
  , inflector = new natural.NounInflector()

// local variables
var rePostType = /_([^\/]+)/
  , reTitle = /:title/
  , reType = /:type/
  , reYear = /:year/
  , reMonth = /:month/
  , reDay = /:day/

function Permalink(permalink, data) {
  // default to an empty object
  data || (data = {})

  // add a trailing slash if the permlink isn't an html file
  if (path.extname(permalink) != '.html') {
    permalink = path.join(permalink, '/')
  }

  this._permalink = permalink
  this._title = data.title
  this._type = data.type
  this._date = moment(data.date)
}

Permalink.prototype.toString = function() {
  return this._permalink.indexOf(':') < 0
    ? this._permalink
    : this._resolve()._permalink
}

Permalink.prototype._replace = function(re, str) {
  this._permalink = this._permalink.replace(re, str)
  return this
}

// resolve all dynamic parts
Permalink.prototype._resolve = function() {
  return this
    ._resolveTitle()
    ._resolveType()
    ._resolveYear()
    ._resolveMonth()
    ._resolveDay()
}

// :title - a URL formatted version of the post title
Permalink.prototype._resolveTitle = function() {
  if (!this._title) return this

  // strip out all unreserved URI characters
  // http://en.wikipedia.org/wiki/Percent-encoding
  var slug = this._title
    .replace(/\s+/g, '-')
    .replace(/[^\w\.\-~]/g, '')
    .toLowerCase()

  return this._replace(reTitle, slug)
}

// :type - the post type name
Permalink.prototype._resolveType = function() {
  return this._type
    ? this._replace(reType, inflector.pluralize(this._type))
    : this
}

// :year - the 4-digit year from the post date
Permalink.prototype._resolveYear = function() {
  return this._replace(reYear, this._date.format('YYYY'))
}

// :month - the 2-digit month form the post date
Permalink.prototype._resolveMonth = function() {
  return this._replace(reMonth, this._date.format('MM'))
}

// :day - the 2-digit day from the post date
Permalink.prototype._resolveDay = function() {
  return this._replace(reDay, this._date.format('DD'))
}

// "Class" methods
Permalink.getFromFile = function(file) {
  var permalink = file.data.permalink
    ? file.data.permalink
    : site.config.permalink

  var data =  {
    title: file.data.title,
    type: file.data.type || (rePostType.test(file.name) && RegExp.$1),
    date: moment(file.data.date)
  }

  return (new Permalink(permalink, data)).toString()
}

module.exports = Permalink
