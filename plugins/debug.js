var fs = require('fs')
  , Handlebars = require('handlebars')

Handlebars.registerHelper('debug', function(obj) {
  debugger
  return obj
})
