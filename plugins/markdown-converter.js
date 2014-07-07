var marked = require('marked');

module.exports = function() {

  // This could be for a post or a page.
  this.events.on('afterRenderContent', function(p) {
    if (p.data.format == 'markdown') {
      p.content = marked(p.content);
    }
  });

};
