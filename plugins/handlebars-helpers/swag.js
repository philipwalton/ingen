var Swag = require('swag')

module.exports = function(site) {
  Swag.registerHelpers(site.Handlebars)
}
