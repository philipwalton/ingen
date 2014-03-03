var moment = require('moment-timezone')

module.exports = function() {

  var config = this.config
  var Handlebars = this.Handlebars

  function datetime(value, options) {
    // if value isn't present, assume the current date/time
    if (!options) {
      options = value
      value = moment()
    }

    var format = options.hash.format
    return moment(value)
      .tz(config.timezone)
      .format(format)
  }

  Handlebars.registerHelper('datetime', datetime.bind(this))
}
