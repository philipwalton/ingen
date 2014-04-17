var path = require('path');
var Handlebars = require('handlebars');
var natural = require('natural');
var inflector = new natural.NounInflector();
var _ = require('lodash-node/modern');

var events = require('./events');
var Template = require('./template');
var Permalink = require('./permalink');
var Taxonomy = require('./taxonomy');
var utilities = require('./utilities');

function Post(obj, type, config) {
  this.init(obj, type, config);
}

Post.prototype.init = function(obj, type, config) {

  // If `type` isn't specified, get it from `obj`
  if (typeof type != 'string') {
    config = type
    type = obj.type
  }

  // Posts must have a type, for now at least.
  if (!type) throw new Error('Posts must be given a type');

  if (obj instanceof Template) {
    this.template = obj;
  } else {
    var content = obj.content;
    delete obj.content;
    this.template = new Template(obj, content, config);
  }

  this.type = type;
  this.typePlural = type ? inflector.pluralize(type) : null;
  this.config = config;

  this._registerTaxonomies();
  this._resolvePermalink();

  utilities.linkProperties(this, this.template.data);
  utilities.linkProperties(this, this.template, ['format', 'filename']);
}


Post.prototype.render = function() {
  events.emit('beforeRenderContent', this)
  this.content = this.template.renderContent(this);
  events.emit('afterRenderContent', this)
  this._makeExcerpt();
}


Post.prototype._resolvePermalink = function() {

  var structure = this.template.data.permalink || this.config.permalink;

  this.permalink = new Permalink(structure, {
    type: this.type,
    filename: this.template.filename,
    title: this.template.data.title,
    date: this.template.date,
    timezone: this.config.timezone
  });
};


Post.prototype._registerTaxonomies = function() {

  this.config.taxonomyTypes.forEach(function(taxonomyType) {
    var taxonomyTypePlural = inflector.pluralize(taxonomyType);
    var taxonomies = [];
    var data = this.template.data;

    if (data[taxonomyTypePlural]) {
      data[taxonomyTypePlural].forEach(function(taxonomyValue) {
        var taxonomy = Taxonomy.getOrCreate(taxonomyType, taxonomyValue);
        taxonomy.posts.push(this);
        taxonomies.push(taxonomy);
      }, this);

      this[taxonomyTypePlural] = taxonomies
    }
  }, this);

}


Post.prototype._makeExcerpt = function() {
  var length = this.template.data.excerptLength || this.config.excerptLength

  this.excerpt = this.content
    .replace(/\s+/g, ' ') // convert new lines and tabs to just spaces
    .replace(/(<([^>]+)>)/ig,'') // strip html tags
    .split(' ')
    .slice(0, length)
    .join(' ')
    .trim()
}

module.exports = Post
