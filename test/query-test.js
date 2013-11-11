var fs = require('fs-extra')
  , expect = require('chai').expect
  , Query = require('../lib/query')
  , posts = fs.readJSONSync('test/fixtures/posts.json')
  , _ = require('lodash')

describe('Query', function() {

  describe('#filter', function() {

    it('can filter a query by post type', function() {
      var q = new Query({type:'article'}, posts)
      expect(q.filter().posts).to.deep.equal(posts.slice(4, 8))
    })

    it('can filter a query by a single taxonomy', function() {
      var q = new Query({tag:'red'}, posts)
      expect(q.filter().posts).to.deep.equal([
        posts[0],
        posts[1],
        posts[4],
        posts[5]
      ])
    })

    it('can filter a query by multiple taxonomies', function() {
      var q = new Query({tag:'red', author:'john'}, posts)
      expect(q.filter().posts).to.deep.equal([
        posts[4]
      ])
    })

    it('can filter a query by both type and taxonomy', function() {
      var q = new Query({type:'article', tag:'blue', author:'philip'}, posts)
      expect(q.filter().posts).to.deep.equal([
        posts[5],
        posts[7]
      ])
      q = new Query({type:'page', author:'philip'}, posts)
      expect(q.filter().posts).to.deep.equal([])
    })

    it('can filter a query with no parameters', function() {
      var q = new Query({}, posts)
      expect(q.filter().posts).to.deep.equal(posts)
    })

  })

  describe('#sort', function() {

    it('can sort posts by title', function() {
      var q = new Query({sortBy:'title'}, posts.slice(0,4))
      expect(q.sort().posts).to.deep.equal([
        posts[0],
        posts[3],
        posts[1],
        posts[2]
      ])
    })

    it('can sort posts by date', function() {
      var q = new Query({sortBy:'date'}, posts.slice(4))
      expect(q.sort().posts).to.deep.equal([
        posts[7],
        posts[5],
        posts[4],
        posts[6]
      ])
    })

    it('sorts by date by default', function() {
      var q = new Query({}, posts.slice(4))
      expect(q.sort().posts).to.deep.equal([
        posts[7],
        posts[5],
        posts[4],
        posts[6]
      ])
    })

  })

  describe('#order', function() {

    it('can put posts in ascending order', function() {
      var q = new Query({order:'asc'}, posts.slice(0,4))
      expect(q.order().posts).to.deep.equal(posts.slice(0,4))
    })

    it('can put posts in descending order', function() {
      var q = new Query({order:'desc'}, posts.slice(0,4))
      expect(q.order().posts).to.deep.equal(posts.slice(0,4).reverse())
    })

    it('puts posts in ascending order by default unless the posts are being sorted by date', function() {
      var q = new Query({}, posts.slice(0,4))
      expect(q.order().posts).to.deep.equal(posts.slice(0,4))
      q = new Query({sortBy:'date'}, posts.slice(0,4))
      expect(q.order().posts).to.deep.equal(posts.slice(0,4).reverse())
    })

  })

  describe('#run', function() {

    it('filters, sorts, and orders a query returning the matched posts', function() {
      var q = new Query({
        type:'article',
        tag:'blue',
        author:'philip',
        sortBy:'date',
        order:'asc'
      }, posts)
      expect(q.run()).to.deep.equal([
        posts[7],
        posts[5]
      ])
    })

  })

})
