var marked = require('marked')
  , hljs = require("highlight.js")
  , site = require('../lib/site')

marked.setOptions({
  highlight: function(code, lang) {
    return lang
      ? hljs.highlight(lang, code).value
      : hljs.highlightAuto(code).value
  }
})

site.on('transform', function(page) {
  if (page.file.extension == '.md') {
    page.file.content = marked(page.file.content)
  }
})
