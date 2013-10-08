var Site
  , fs = require('fs')
  , path = require('path')
  , config = JSON.parse(fs.readFileSync('_config.json', 'utf8'))
  , glob = require('glob')
  , minimatch = require('minimatch')
  , File = require('./file')

Site = {

  build: function() {

    glob
      .sync('**/*', {dot: true})
      .forEach(function(filename) {
        // ignore files or directories at the root
        // level that start with an underscore
        if (filename[0] == '_') return

        // ignore directories
        // TODO: consider async
        if (!fs.statSync(filename).isFile()) return

        // ignore files that have been explicitly excluded
        if (config.exclude && config.exclude.some(function(pattern) {
          return minimatch(filename, pattern)
        })) {
          console.log(filename, config.exclude)
          return
        }

        // still here? must be a match
        // console.log(filename)
        new File(filename)
      })

  },

  serve: function(port) {

  }

}

/*

  Page.addTransformer(function(page) {
    if (page.extension == ".md") {
      return page.renderMarkdown()
    }
  })

  Page.addTransformer(function(page) {
    if (page.extension == ".html") {
      return page.renderTempalte()
    }
  })

  Site.on("beforeBuild", function(site) {})

  Site.on("afterBuild", function(site) {})



*/

module.exports = Site
