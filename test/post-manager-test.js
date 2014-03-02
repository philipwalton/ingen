var fs = require('fs-extra');
var expect = require('chai').expect;
// var _ = require('lodash-node/modern')

var PostManager = require('../lib/post-manager');
var posts = fs.readJSONSync('test/fixtures/posts.json');

describe('PostManager', function() {

  describe('#add', function() {
    it('can add a post to the posts array', function() {
      var pm = new PostManager(['tag', 'author']);
      var recipe = posts[0];
      var article = posts[8];

      pm.add(recipe);
      expect(pm.all()).to.deep.equal([recipe]);

      pm.add(article);
      expect(pm.all()).to.deep.equal([recipe, article]);
    });
  });

  describe('#all', function() {
    it('returns an array of all posts', function() {
      var pm = new PostManager(['tag', 'author']);
      var recipe = posts[0];
      var article = posts[8];

      pm.add(recipe);
      pm.add(article);

      expect(pm.all()).to.deep.equal([recipe, article]);

    });
  });

  describe('#getByTaxonomy', function() {
    it('returns an array of posts with the specified '
        + 'taxonomy name and value', function() {

      var pm = new PostManager(['tag', 'author']);
      posts.forEach(pm.add, pm);

      expect(pm.getByTaxonomy('author', 'philip')).to.deep.equal([
        posts[5],
        posts[6],
        posts[8],
        posts[9]
      ]);

      expect(pm.getByTaxonomy('tag', 'green')).to.deep.equal([
        posts[0],
        posts[2],
        posts[3],
        posts[5],
        posts[7],
        posts[8]
      ]);

    });

  });

});
