module.exports = function(site) {
  site.Handlebars.registerHelper('inspect', function(obj) {
    debugger
    return obj
  })
}
