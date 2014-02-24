var moment = require('moment-timezone')

module.exports = function(site) {

  site.Handlebars.registerHelper('datetime', function(value, options) {
    // if value isn't present, assume the current date/time
    if (!options) {
      options = value
      value = moment()
    }

    var format = options.hash.format
    return moment(value)
      .tz(site.config.timezone)
      .format(format)
  })

}
