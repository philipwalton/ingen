var fs = require('fs')
  , site = require('../lib/site')
  , events = require('../lib/events')
  , Page = require('../lib/page')
  , File = require('../lib/file')
  , natural = require('natural')
  , inflector = new natural.NounInflector()
  , _ = require('lodash')


var layoutExists = _.memoize(function(layout) {
  return fs.existsSync('_layouts/' + layout + '.html')
})

events.on('beforeBuild', function() {

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

      // add the taxonomy to the query params
      obj.query = {}
      obj.query[taxonomyType] = taxonomyValue

      new Page(obj)
    }
  })

})
