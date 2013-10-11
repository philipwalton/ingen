var fs = require('fs')
  , path = require('path')
  , config = JSON.parse(fs.readFileSync('_config.json', 'utf8'))
  , glob = require('glob')
  , minimatch = require('minimatch')
  , File = require('./file')
  , _ = require('lodash')


var inspect = function(obj) {
  console.log(require('util').inspect(obj, {colors:true}))
}

module.exports = {

  /**
   * Get config data from _config.json
   *
   * @return {Object}
   * @api private
   */

  _getConfig: function() {
    var config = JSON.parse(fs.readFileSync('_config.json', 'utf8'))
    return _.defaults(config, {
      permalink: "/:title",
      exclude: [],
      source: "./",
      destination: "./_site"
    })
  },

  _getContentTypeFiles: function() {
    var site = this
      , types = this.config.contentTypes

    types.forEach(function(type) {
      site[type] = glob.sync('_' + type + '/*.*')
    })
  },

  _walkFiles: function() {
    var config = this.config
    this.files = glob
      .sync('**/*', {dot: true})
      .filter(function(filename) {
        // ignore files or directories at the root
        // level that start with an underscore
        if (filename.charAt(0) == '_') return

        var matchesExclude = _.any(config.exclude, function(pattern) {
          return minimatch(filename, pattern)
        })
        // ignore files matching the exlude config array
        if (matchesExclude) return

        // ignore directories
        // TODO: consider async
        if (!fs.statSync(filename).isFile()) return

        // include everything else
        return true
      })
  },

  build: function() {
    var config = this.config = this._getConfig()

    this._getContentTypeFiles()
    this._walkFiles()

    // inspect(this.config)
    inspect(this)


    return
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
