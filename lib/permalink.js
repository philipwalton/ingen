// dependencies
var path = require('path')
var moment = require('moment')
var natural = require('natural')
var inflector = new natural.NounInflector()

// local variables
var reTitle = /:title/
var reFilename = /:filename/
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

  this.permalink = permalink
  this.pagenum = data.pagenum
  this.title = data.title
  this.filename = data.filename
  this.type = data.type
  this.date = moment(data.date)
}

Permalink.prototype.toString = function() {
  return this.permalink.indexOf(':') < 0
    ? this.permalink
    : this._resolve().permalink
}

// Append additional directory data to the end of a permalink
// If the permalink ends in an extension, append the directories
// immedialy before the file and keep the file and extension at the end
// Examples: .append('page/2')
//   - /foo/bar => /foo/bar/page/2
//   - /foo/bar.html => /foo/page/2/bar.html
Permalink.prototype.append = function(dirs) {
  if (path.extname(this.permalink)) {
    this.permalink = path.join(
      path.dirname(this.permalink),
      dirs,
      path.basename(this.permalink)
    )
  } else {
    this.permalink = path.join(this.permalink, dirs)
  }
  return this
}

Permalink.prototype.clone = function() {
  return new Permalink(this.permalink, this)
};

Permalink.prototype.replace = function(re, str) {
  this.permalink = this.permalink.replace(re, str)
  return this
}

// resolve all dynamic parts
Permalink.prototype._resolve = function() {
  return this
    ._resolveTitle()
    ._resolveFilename()
    ._resolveType()
    ._resolveYear()
    ._resolveMonth()
    ._resolveDay()
    ._resolvePagenum()
}

// :title - a URL formatted version of the title
Permalink.prototype._resolveTitle = function() {
  if (!this.title) return this

  // strip out all unreserved URI characters
  // http://en.wikipedia.org/wiki/Percent-encoding
  var slug = this.title
    .replace(/\s+/g, '-')
    .replace(/[^\w\.\-~]/g, '')
    .toLowerCase()

  return this.replace(reTitle, slug)
}

// :filename - the filename without directory or extension
Permalink.prototype._resolveFilename = function() {
  if (!this.filename) return this

  var basename = path.basename(this.filename)
  var filename = basename.substr(0, basename.lastIndexOf('.'))

  return this.replace(reFilename, filename)
}

// :type - the post type name
Permalink.prototype._resolveType = function() {
  return this.type
    ? this.replace(reType, inflector.pluralize(this.type))
    : this
}

// :year - the 4-digit year from the post date
Permalink.prototype._resolveYear = function() {
  return this.replace(reYear, this.date.format('YYYY'))
}

// :month - the 2-digit month form the post date
Permalink.prototype._resolveMonth = function() {
  return this.replace(reMonth, this.date.format('MM'))
}

// :day - the 2-digit day from the post date
Permalink.prototype._resolveDay = function() {
  return this.replace(reDay, this.date.format('DD'))
}

// :pagenum - the page number of paginated pages
Permalink.prototype._resolvePagenum = function() {
  return this.replace(rePagenum, this.pagenum)
}

module.exports = Permalink
