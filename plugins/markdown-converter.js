var marked = require('marked')
var events = require('../lib/events')

events.on('afterRenderContent', function(page) {
  if (page.extension == '.md') {
    // TODO: changing the extention should be automatically done
    // by the Permalink object.
    page.permalink = page.permalink.replace(/\.md$/, '.html')
    page.content = marked(page.content)
  }
})
