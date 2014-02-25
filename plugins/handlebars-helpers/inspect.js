module.exports = function() {
  this.Handlebars.registerHelper('inspect', function(obj) {
    debugger
    return obj
  })
}
