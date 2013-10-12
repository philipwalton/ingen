var fs = require('fs')
  , Handlebars = require('handlebars')

Handlebars.registerHelper('include', function(filename) {
  var source = fs.readFileSync(filename, 'utf8')
    , template = Handlebars.compile(source)
  return new Handlebars.SafeString(template(this))
})
