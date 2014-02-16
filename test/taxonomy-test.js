var expect = require('chai').expect
var _ = require('lodash-node/modern')

var Taxonomy = require('../lib/taxonomy')

var taxonomies = [
  {type: 'tag', value: 'foo'},
  {type: 'tag', value: 'bar'},
  {type: 'category', value: 'fizzbuzz'}
]

// var config = require('../lib/config').init()
// var originalConfig = _.clone(config)

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

})
