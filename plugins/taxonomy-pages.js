var fs = require('fs')
  , site = require('../lib/site')
  , Page = require('../lib/page')
  , File = require('../lib/file')
  , natural = require('natural')
  , inflector = new natural.NounInflector()
  , _ = require('lodash')

site.on('beforeBuild', function() {

  _.each(site._taxonomies, function(taxonomyValues, taxonomyTypePlural) {

    var taxonomyType = inflector.singularize(taxonomyTypePlural)

    _.each(taxonomyValues, function(taxonomyValue) {
      if (fs.existsSync('_layouts/' + taxonomyType.toLowerCase() + '.html')) {
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

})
