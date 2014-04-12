var expect = require('chai').expect
var _ = require('lodash-node/modern')

var Taxonomy = require('../lib/taxonomy')

var taxonomies = [
  {type: 'tag', value: 'foo'},
  {type: 'tag', value: 'bar'},
  {type: 'category', value: 'fizzbuzz'}
]

describe('Taxonomy', function() {

  beforeEach(function() {
    Taxonomy.reset()
  })

  afterEach(function() {
    Taxonomy.reset()
  })

  describe('.all', function() {
    it('returns an object of taxonomy types and values', function() {
      _.each(taxonomies, function(taxonomy) {
        new Taxonomy(taxonomy.type, taxonomy.value)
      })

      expect(_.keys(Taxonomy.all())).to.deep.equal(['tag', 'category'])
      expect(Taxonomy.all().tag.foo instanceof Taxonomy).to.be.ok
      expect(Taxonomy.all().tag.bar instanceof Taxonomy).to.be.ok
      expect(Taxonomy.all().category.fizzbuzz instanceof Taxonomy).to.be.ok
    })
  })

  describe('.each', function() {
    it('accepts a function, iterates over each post, and '
        + 'calls the function with the taxonomy as its argument', function() {

      _.each(taxonomies, function(taxonomy) {
        new Taxonomy(taxonomy.type, taxonomy.value)
      })

      var i = 0;
      Taxonomy.each(function(taxonomy) {
        expect(taxonomy.type).to.equal(taxonomies[i].type)
        expect(taxonomy.value).to.equal(taxonomies[i].value)
        i++
      })
    })
  })

  describe('.reset', function() {
    it('restores the taxnomy object to being empty', function() {
      _.each(taxonomies, function(taxonomy) {
        new Taxonomy(taxonomy.type, taxonomy.value)
      })

      expect(_.keys(Taxonomy.all())).to.deep.equal(['tag', 'category'])
      Taxonomy.reset()
      expect(_.keys(Taxonomy.all())).to.deep.equal([])
    })
  })

  describe('.getOrCreate', function() {
    it('creates a new instance unless an identical one exists', function() {

      var t1 = Taxonomy.getOrCreate('tag', 'foo')
      var t2 = Taxonomy.getOrCreate('tag', 'foo')
      var t3 = Taxonomy.getOrCreate('tag', 'bar')

      expect(t1).to.equal(t2)
      expect(t2).to.not.equal(t3)
    })
  })

  describe('#init', function() {
    it('initializes a new taxonomy object from a type and value', function() {
      var t = new Taxonomy('tag', 'foo')
      expect(t.type).to.equal('tag')
      expect(t.typePlural).to.equal('tags')
      expect(t.value).to.equal('foo')
      expect(t.posts).to.deep.equal([])
    })
  })

  describe('#toString', function() {
    it('returns the value of the taxonomy', function() {
      var t = new Taxonomy('tag', 'foo')
      expect(t.toString()).to.equal('foo')
    })
  })
})
