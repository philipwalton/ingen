var fs = require('fs')
var natural = require('natural')
var inflector = new natural.NounInflector()
var _ = require('lodash')

var events = require('../lib/events')
var Page = require('../lib/page')
var Taxonomy = require('../lib/taxonomy')

var layoutExists = function(layout) {
  return fs.existsSync('_layouts/' + layout + '.html')
}

events.on('beforeBuild', function() {

  Taxonomy.each(function(taxonomyValue, taxonomyType, taxonomyTypePlural) {
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
