var fs = require('fs')
  , Handlebars = require('handlebars')

Handlebars.registerHelper('debug', function(obj) {
  console.log(obj)
  debugger
  return obj
})
