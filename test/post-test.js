var fs = require('fs-extra');
var assert = require('assert');
var _ = require('lodash-node/modern');

var Config = require('../lib/config');
var Post = require('../lib/post');
var Template = require('../lib/template');
var Taxonomy = require('../lib/taxonomy');
var posts = fs.readJSONSync('test/fixtures/posts.json');

describe('Post', function() {

  var config = new Config({
    layoutsDirectory: 'test/fixtures',
    taxonomyTypes: ['tag']
  });

  afterEach(Taxonomy.reset);

  describe('#init', function() {

    it('can initialize a new post from a template instance', function() {
      var template = new Template('test/fixtures/post.md', config);
      var post = new Post(template, 'post', config);

      assert.equal(post.type, 'post');
      assert.equal(post.template, template);
      assert.equal(post.permalink.toString(), '/post-test/');
      assert.equal(template.data.title, 'Post Test');
      assert.equal(template.data.date, '2013-10-03T12:34:56-08:00');
      assert.deepEqual(template.data.tags, ['foo', 'bar', 'fizz', 'buzz']);
      assert.equal(template.content.trim(), 'Post test content.');
    });

    it('can initialize a new post from an object, which creates a template'
        + 'instance behind the scenes', function() {

      var post = new Post(posts[0], config);

      assert(post.template instanceof Template);

      assert.equal(post.permalink.toString(), '/the-1st-recipe/');
      assert.equal(post.template.data.title, 'The 1st Recipe');
      assert.equal(post.template.data.type, 'recipe');
      assert.equal(post.template.data.date, '2013-01-01T12:34:56-08:00');
      assert.deepEqual(post.template.data.tags, ['red', 'green']);
      assert.equal(post.template.content,
        'This is the content of the first recipe');
    });

    it('creates taxonomy objects for each taxonomy on the post', function() {
      var post = new Post(posts[0], config);
      var taxonomies = Taxonomy.all();
      assert.deepEqual(Object.keys(taxonomies.tag), ['red', 'green']);
      assert.equal(taxonomies.tag.red.posts[0], post);
      assert.equal(taxonomies.tag.green.posts[0], post);
    });

    // it('sets hidden getter links for some taxonomy properties', function() {
    //   var template = new Template('test/fixtures/post.md', config);
    //   var post = new Post(template, 'post', config);

    //   assert.equal(post.title, post.template.data.title);
    //   assert.equal(post.format, post.template.format);
    //   assert.equal(post.filename, post.template.filename);
    // });

  });

  describe('#render', function() {
    it('renders the post content with any template data', function() {
      var data =  {
        type: 'article',
        title: 'This is the title',
        content: '{{title}}, and this is the content'
      };
      var post = new Post(data, config);
      post.render();
      assert.equal(post.content, 'This is the title, and this is the content');
    });

    it('makes an excerpt from the rendered content that strips out HTML and '
        + 'extraneous whitespece', function() {

      var data =  {
        type: 'article',
        title: 'This is the title',
        content: '{{title}},\n\nand <b>here\'s</b> some content. Oh yeah!'
      };
      var config = new Config({ excerptLength: 8 });

      var post = new Post(data, config);
      post.render();
      assert.equal(
        post.excerpt,
        'This is the title, and here\'s some content.'
      );
    });
  });

});
