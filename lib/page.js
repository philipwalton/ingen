var fs = require('fs-extra')
var path = require('path')
var util = require('util')
var mkdirp = require('mkdirp')
var natural = require('natural')
var inflector = new natural.NounInflector()
var Handlebars = require('handlebars')
var _ = require('lodash-node/modern')

var events = require('./events')
var Template = require('./template')
var Post = require('./post')
var Permalink = require('./permalink')
var Query = require('./query')

// store a collection of all pages
var pages = []

function Page(obj, config) {
  pages.push(this)

  this.init(obj, config)
}


Page.prototype.init = function(obj, config) {

  // Pages can be created from Posts, Templates, or plain objects.
  if (obj instanceof Post) {
    this.post = obj
    this.template = obj.template;
  }
  else if (obj instanceof Template) {
    this.template = obj;
  }
  else {
    var content = obj.content;
    delete obj.content;
    this.template = new Template(obj, content, config);
  }

  this.site = this.config = config;
  this.permalink = (this.post && this.post.permalink)
    ? this.post.permalink
    : this.template.resolvePermalink();

  this.template.setGetterLinks(this);
}

// TODO: is passing all the posts here the best way?
Page.prototype.paginate = function(posts) {

  // only paginate if there's a query
  var query = this.template.data.query;
  if (!query) return

  // only paginate a page the first time through
  // (i.e., when making page/2/ don't do this logic again)
  // TODO: there's gotta be a better way to do this.
  if (query.page > 1) return

  var limit = query.limit
  var unpagedQuery = new Query(_.omit(query, 'limit', 'page'), posts)
  var postCount = unpagedQuery.run().length
  var totalPages = Math.ceil(postCount / limit)
  var pagenum = 1
  var pages = [this]

  // create additional pages required for pagination
  while (++pagenum <= totalPages) {
    var template = this.template.clone();
    template.data.query.page = pagenum;

    var page = new Page(template, this.config);
    page.permalink.append('page/' + pagenum)

    pages.push(page);
  }

  // add pagination data to the newly created pages
  if (totalPages > 1) {
    _.each(pages, function(page, i) {
      page.paginated = true
      if (i === 0) {
        page.prevPage = false
        page.nextPage = pages[i + 1]
      }
      else if (i == totalPages - 1) {
        page.nextPage = false
        page.prevPage = pages[i - 1]
      }
      else {
        page.nextPage = pages[i + 1]
        page.prevPage = pages[i - 1]
      }
    })
  }
}


Page.prototype.render = function() {

  // Render the content.
  if (this.post && this.post.content) {
    this.content = this.post.content
  } else {
    events.emit('beforeRenderContent', this)
    this.content = this.template.renderContent(this);
    events.emit('afterRenderContent', this)
  }

  // Render the layout.
  events.emit('beforeRenderLayout', this)
  this.content = this.template.renderLayout(this.content, this);
  events.emit('afterRenderLayout', this)

  console.log('Rendering ' + this.template.data.title)
}


Page.prototype.write = function() {

  var destination = path.join(this.config.destination, this.permalink.toString())

  events.emit('beforeWrite', this)

  // if destination is a folder, create an index.html
  if (!path.extname(destination)) {
    destination = path.join(destination, 'index.html')
  }

  fs.outputFileSync(destination, this.content)

  console.log('Writing ' + this.template.data.title + ' to ' + destination)
  events.emit('afterWrite', this)
}

Page.all = function() {
  return pages
}

Page.each = function(cb) {
  _.each(pages, cb)
}

Page.reset = function() {
  pages = []
}

module.exports = Page
