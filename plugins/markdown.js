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

site.on('transformFile', function(page) {
  if (page.extension == '.md') {
    page.permalink = page.permalink.replace(/\.md$/, '.html')
    page.content = marked(page.content)
  }
})
