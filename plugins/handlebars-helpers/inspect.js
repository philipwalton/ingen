var fs = require('fs')
var Handlebars = require('handlebars')

Handlebars.registerHelper('inspect', function(obj) {
  debugger
  return obj
})
