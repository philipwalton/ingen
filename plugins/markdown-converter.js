var marked = require('marked')

module.exports = function() {

  this.events.on('afterRenderContent', function(page) {
    if (page.extension == '.md') {
      // TODO: changing the extention should be automatically done
      // by the Permalink object.
      page.permalink = page.permalink.replace(/\.md$/, '.html')
      page.content = marked(page.content)
    }
  })

}

