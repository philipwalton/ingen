module.exports = function() {

  var config = this.config;
  var Handlebars = this.Handlebars;

  Handlebars.registerHelper('truncateWords', function(content, options) {
    var wordCount = options.hash.limit || config.defaultLimit;
    return content
      .replace(/(<([^>]+)>)/ig, '')
      .split(' ')
      .slice(0, wordCount)
      .join(' ')
      .trim();
  });

};
