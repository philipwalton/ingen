var fs = require('fs')
var natural = require('natural')
var inflector = new natural.NounInflector()
var _ = require('lodash-node/modern')

var config = require('../lib/config')
var Page = require('../lib/page')
var Taxonomy = require('../lib/taxonomy')

var layoutExists = function(layout) {
  return fs.existsSync(config.layoutsDirectory + '/' + layout + '.html')
}

module.exports = function() {

  this.events.on('beforeBuild', function() {

    Taxonomy.each(function(taxonomy) {
      if (layoutExists(taxonomy.type.toLowerCase())) {
        var obj = {
          content: '',
          title: taxonomy.value,
          permalink: (taxonomy.typePlural + '/' + taxonomy.value).toLowerCase(),
          layout: taxonomy.type.toLowerCase()
        }
        // add the taxonomy type and value to the page data
        obj[taxonomy.type] = taxonomy.value

        // add the taxonomy to the query params
        obj.query = {}
        obj.query[taxonomy.type] = taxonomy.value

        taxonomy.page = new Page(obj)
      }
    })

  })

}
