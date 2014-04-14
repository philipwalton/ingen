var marked = require('marked');
var md = /\.md$/;

module.exports = function() {

  // This could be for a post or a page.
  this.events.on('afterRenderContent', function(p) {
    if (md.test(p.template.filename)) {
      // TODO: changing the extention might be automatically done
      // by the Permalink object.
      p.permalink = p.permalink.replace(/\.md$/, '.html')
      p.content = marked(p.content)
    }
  })

}

