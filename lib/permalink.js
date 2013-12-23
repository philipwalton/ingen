// dependencies
var path = require('path')
var moment = require('moment')
var natural = require('natural')
var inflector = new natural.NounInflector()

// local variables
var reTitle = /:title/
var reType = /:type/
var reYear = /:year/
var reMonth = /:month/
var reDay = /:day/
var rePagenum = /:pagenum/

function Permalink(permalink, data) {
  // default to an empty object
  data || (data = {})

  // ensure permalink begins with a slash
  permalink = path.join('/', permalink)

  // add a trailing slash for non-file permalinks
  if (!path.extname(permalink)) {
    permalink = path.join(permalink, '/')
  }

  this._permalink = permalink
  this._pagenum = data.pagenum
  this._title = data.title
  this._type = data.type
  this._date = moment(data.date)
}

Permalink.prototype.toString = function() {
  return this._permalink.indexOf(':') < 0
    ? this._permalink
    : this._resolve()._permalink
}

// Append additional directory data to the end of a permalink
// If the permalink ends in an extension, append the directories
// immedialy before the file and keep the file and extension at the end
// Examples: .append('page/2')
//   - /foo/bar => /foo/bar/page/2
//   - /foo/bar.html => /foo/page/2/bar.html
Permalink.prototype.append = function(dirs) {
  if (path.extname(this._permalink)) {
    this._permalink = path.join(
      path.dirname(this._permalink),
      dirs,
      path.basename(this._permalink)
    )
  } else {
    this._permalink = path.join(this._permalink, dirs)
  }
  return this
}

Permalink.prototype.clone = function() {
  return new Permalink(this._permalink, {
    pagenum: this._pagenum,
    title: this._title,
    type: this._type,
    date: this._date
  })
};

Permalink.prototype.replace = function(re, str) {
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
    ._resolvePagenum()
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

  return this.replace(reTitle, slug)
}

// :type - the post type name
Permalink.prototype._resolveType = function() {
  return this._type
    ? this.replace(reType, inflector.pluralize(this._type))
    : this
}

// :year - the 4-digit year from the post date
Permalink.prototype._resolveYear = function() {
  return this.replace(reYear, this._date.format('YYYY'))
}

// :month - the 2-digit month form the post date
Permalink.prototype._resolveMonth = function() {
  return this.replace(reMonth, this._date.format('MM'))
}

// :day - the 2-digit day from the post date
Permalink.prototype._resolveDay = function() {
  return this.replace(reDay, this._date.format('DD'))
}

// :pagenum - the page number of paginated pages
Permalink.prototype._resolvePagenum = function() {
  return this.replace(rePagenum, this._pagenum)
}

module.exports = Permalink
