var fs = require('fs-extra');
var expect = require('chai').expect;
// var _ = require('lodash-node/modern')

var PostManager = require('../lib/post-manager')
var posts = fs.readJSONSync('test/fixtures/posts.json');

describe('PostManager', function() {

  describe('new', function() {
    it('creates a new post manager instance with a posts array'
        + 'and a taxonomy organizer', function() {

      var pm = new PostManager(['tag', 'author']);
      expect(pm.posts).to.deep.equal([]);
      expect(pm.taxonomyTypes).to.deep.equal(['tag', 'author']);
      expect(pm.taxonomies).to.deep.equal({'tag': {}, 'author': {}});

    });
  });

  describe('#add', function() {
    it('can add a post to the posts array', function() {
      var pm = new PostManager(['tag', 'author']);
      var recipe = posts[0];
      var article = posts[8];

      pm.add(recipe);
      expect(pm.posts).to.deep.equal([recipe]);
      expect(pm.taxonomies).to.deep.equal({
        'author': {},
        'tag': {
          'red': [recipe],
          'green': [recipe]
        }
      });

      pm.add(article);
      expect(pm.posts).to.deep.equal([recipe, article]);
      expect(pm.taxonomies).to.deep.equal({
        'author': {
          'philip': [article]
        },
        'tag': {
          'red': [recipe],
          'green': [recipe, article],
          'blue': [article]
        }
      });

    });
  })

});