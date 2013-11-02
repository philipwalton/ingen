var fs = require('fs')
  , site = require('../lib/site')
  , Page = require('../lib/page')
  , File = require('../lib/file')
  , natural = require('natural')
  , inflector = new natural.NounInflector()
  , _ = require('lodash')


var layoutExists = _.memoize(function(layout) {
  return fs.existsSync('_layouts/' + layout + '.html')
})

site.on('beforeBuild', function() {

  site.eachTaxonomy(function(taxonomyValue, taxonomyType, taxonomyTypePlural) {
    if (layoutExists(taxonomyType.toLowerCase())) {
      var obj = {
        content: '',
        title: taxonomyValue,
        permalink: (taxonomyTypePlural + '/' + taxonomyValue).toLowerCase(),
        layout: taxonomyType.toLowerCase()
      }
      // add the taxonomy type and value to the page data
      obj[taxonomyType] = taxonomyValue
      new Page(obj)
    }
  })

})
