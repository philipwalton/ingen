var site = require('./lib/site')

// expose local modules
site.config = require('./lib/config')
site.events = require('./lib/events')
site.Post = require('./lib/Post')
site.Page = require('./lib/Page')
site.Query = require('./lib/Query')
site.Taxonomy = require('./lib/Taxonomy')
site.Permalink = require('./lib/Permalink')

// expose instances of npm modules
site.Handlebars = require('handlebars')

module.exports = site
