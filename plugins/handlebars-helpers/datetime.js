var moment = require('moment-timezone')

module.exports = function() {

  function datetime(value, options) {
    // if value isn't present, assume the current date/time
    if (!options) {
      options = value
      value = moment()
    }

    var format = options.hash.format
    return moment(value)
      .tz(site.config.timezone)
      .format(format)
  }

  this.Handlebars.registerHelper('datetime', datetime.bind(this))
}
