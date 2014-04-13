var fs = require('fs')
var natural = require('natural')
var inflector = new natural.NounInflector()
var _ = require('lodash-node/modern')

var Template = require('../lib/template')

module.exports = function() {

  var Page = this.Page
  var Taxonomy = this.Taxonomy
  var config = this.config

  function layoutExists(layout) {
    return fs.existsSync(config.layoutsDirectory + '/' + layout + '.html')
  }

  this.events.on('beforeBuild', function() {

    Taxonomy.each(function(taxonomy) {
      if (layoutExists(taxonomy.type.toLowerCase())) {
        var obj = {
          title: taxonomy.value,
          permalink: (taxonomy.typePlural + '/' + taxonomy.value).toLowerCase(),
          layout: taxonomy.type.toLowerCase()
        }
        // add the taxonomy type and value to the page data
        obj[taxonomy.type] = taxonomy.value

        // add the taxonomy to the query params
        obj.query = {}
        obj.query[taxonomy.type] = taxonomy.value

        var f = new Template(obj, '', config)

        taxonomy.page = new Page(f, config)
      }
    })

  })

}
