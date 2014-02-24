module.exports = function(site) {

  site.Handlebars.registerHelper('truncateWords', function(content, options) {
    var wordCount = options.hash.limit || site.config.defaultLimit
    return content
      .replace(/(<([^>]+)>)/ig,"")
      .split(' ')
      .slice(0, wordCount)
      .join(' ')
      .trim()
  })

}
