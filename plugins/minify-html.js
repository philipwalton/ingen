var site = require('../lib/site')
  , minify = require('html-minifier').minify

// http://perfectionkills.com/experimenting-with-html-minifier/#options
var options = {
  removeIgnored: false,
  removeComments: true,
  removeCommentsFromCDATA: true,
  removeCDATASectionsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeRedundantAttributes: true,
  useShortDoctype: true,
  removeEmptyAttributes: true,
  removeEmptyElements: false,
  removeOptionalTags: false,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true
}

site.on('beforeWrite', function(page) {
  // page.content = minify(page.content, options)
})
