var Handlebars = require('handlebars')
var moment = require('moment-timezone')

var config = require('../../lib/config')

Handlebars.registerHelper('datetime', function(value, options) {
  // if value isn't present, assume the current date/time
  if (!options) {
    options = value
    value = moment()
  }

  var format = options.hash.format
  return moment(value).tz(config.timezone).format(format)
})
