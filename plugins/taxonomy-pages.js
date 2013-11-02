var fs = require('fs')
  , site = require('../lib/site')
  , Page = require('../lib/page')
  , File = require('../lib/file')
  , natural = require('natural')
  , inflector = new natural.NounInflector()

site.on('beforeBuild', function() {

  site.config.taxonomies.forEach(function(type) {
    var typePlural = inflector.pluralize(type)

    Object.keys(site._taxonomies[typePlural]).forEach(function(value) {

      if (fs.existsSync('_layouts/' + type.toLowerCase() + '.html')) {
        var obj = {
          content: '',
          title: value,
          permalink: (typePlural + '/' + value).toLowerCase(),
          layout: type.toLowerCase()
        }
        // add the taxonomy type and value to the page data
        obj[type] = value

        new Page(obj)
      }

    })
  })

})
