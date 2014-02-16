var fs = require('fs-extra')
var expect = require('chai').expect
var _ = require('lodash-node/modern')

var Query = require('../lib/query')

var posts = fs.readJSONSync('test/fixtures/posts.json')
var recipes = posts.slice(0,5)
var articles = posts.slice(5)

var recipesUnsorted = [
  recipes[1],
  recipes[3],
  recipes[4],
  recipes[2],
  recipes[0]
]
var articlesUnsorted = [
  articles[1],
  articles[3],
  articles[4],
  articles[2],
  articles[0]
]

describe('Query', function() {

  describe('#filter', function() {

    it('can filter a query by post type', function() {
      var q = new Query({type:'article'}, posts)
      expect(q.filter().posts).to.deep.equal(articles)
    })

    it('can filter a query by a single taxonomy', function() {
      var q = new Query({tag:'red'}, posts)
      expect(q.filter().posts).to.deep.equal([
        posts[0],
        posts[1],
        posts[4],
        posts[5],
        posts[6],
        posts[9]
      ])
    })

    it('can filter a query by multiple taxonomies', function() {
      var q = new Query({tag:'red', author:'john'}, posts)
      expect(q.filter().posts).to.deep.equal([
        posts[5]
      ])
    })

    it('can filter a query by both type and taxonomy', function() {
      var q = new Query({type:'article', tag:'blue', author:'philip'}, posts)
      expect(q.filter().posts).to.deep.equal([
        posts[6],
        posts[8]
      ])
      q = new Query({type:'recipe', author:'philip'}, posts)
      expect(q.filter().posts).to.deep.equal([])
    })

    it('can filter a query with no parameters', function() {
      var q = new Query({}, posts)
      expect(q.filter().posts).to.deep.equal(posts)
    })

  })

  describe('#sort', function() {

    it('can sort posts by title', function() {
      var q = new Query({sortBy:'title'}, recipesUnsorted)
      expect(q.sort().posts).to.deep.equal(recipes)
    })

    it('can sort posts by date', function() {
      var q = new Query({sortBy:'date'}, articlesUnsorted)
      expect(q.sort().posts).to.deep.equal(articles)
    })

    it('sorts by date by default', function() {
      var q = new Query({}, articlesUnsorted)
      expect(q.sort().posts).to.deep.equal(articles)
    })

  })

  describe('#order', function() {

    it('can put posts in ascending order', function() {
      var q = new Query({order:'asc'}, recipesUnsorted)
      expect(q.order().posts).to.deep.equal(recipes)
    })

    it('can put posts in descending order', function() {
      var q = new Query({order:'desc'}, recipesUnsorted)
      expect(q.order().posts).to.deep.equal(recipes.reverse())
    })

    it('puts posts in ascending order by default unless the posts are being sorted by date', function() {
      var q = new Query({}, recipesUnsorted)
      expect(q.order().posts).to.deep.equal(recipes)
      q = new Query({sortBy:'date'}, recipesUnsorted)
      expect(q.order().posts).to.deep.equal(recipes.reverse())
    })

  })

  describe('#limit', function() {

    it('can limit posts by the specified limit amount', function() {
      var q = new Query({
        limit: 3,
        sortBy: 'title'
      }, recipes)
      expect(q.run()).to.deep.equal(recipes.slice(0,3))
    })

    it('can paginate posts via the specified page and limit', function() {
      var q = new Query({
        limit: 3,
        sortBy: 'title',
        page: 2
      }, recipes)
      expect(q.run()).to.deep.equal(recipes.slice(3))
    })

  })

  describe('#run', function() {

    it('filters, sorts, orders, and limits a query returning the matched posts', function() {
      var q = new Query({
        type:'article',
        tag:'blue',
        author:'philip',
        sortBy:'date',
        order:'asc',
        limit: 1,
        page: 2
      }, posts)
      expect(q.run()).to.deep.equal([articles[3]])
    })

  })

})
