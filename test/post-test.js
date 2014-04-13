var fs = require('fs-extra')
var expect = require('chai').expect
var _ = require('lodash-node/modern')

var Config = require('../lib/config')
var Post = require('../lib/post')
var Template = require('../lib/template')
var Taxonomy = require('../lib/taxonomy')
var posts = fs.readJSONSync('test/fixtures/posts.json')

describe('Post', function() {

  var config = new Config({
    layoutsDirectory: 'test/fixtures',
    taxonomyTypes: ['tag']
  });

  describe('#init', function() {
    it('can initialize a new post from an object', function() {
      var p = new Post(posts[0], config)
      expect(p.title).to.equal('The 1st Recipe')
      expect(p.type).to.equal('recipe')
      expect(p.date).to.equal('2013-01-01T12:34:56-08:00')
      expect(p.tags).to.deep.equal(['red', 'green'])
      expect(p.content).to.equal('This is the content of the first recipe')
    })

    it('can initialize a new post from a file instance', function() {
      var template = new Template('test/fixtures/post.md', config)
      // stub out the layout because we're not in the build context
      delete template.data.layout

      var p = new Post(template, 'post', config)
      expect(p.title).to.equal('Post Test')
      expect(p.type).to.equal('post')
      expect(p.date).to.equal('2013-10-03T12:34:56-08:00')
      expect(p.tags).to.deep.equal(['foo', 'bar', 'fizz', 'buzz'])
      expect(p.content.trim()).to.equal('Post test content.')
    })
  })

  describe('#registerTaxonomies', function() {
    it('creates taxonomy objects for each taxonomy on the post', function() {

      var p = new Post(posts[0], config)
      p.registerTaxonomies()

      var taxonomies = Taxonomy.all()
      expect(Object.keys(taxonomies.tag)).to.deep.equal(['red', 'green'])
      expect(taxonomies.tag.red.posts[0]).to.equal(p)
      expect(taxonomies.tag.green.posts[0]).to.equal(p)

      Taxonomy.reset()
    })
  })

  describe('#render', function() {
    it('renders the post content with any template data', function() {
      var p = new Post({
        title: 'This is the title',
        content: '{{title}}, and this is the content'
      }, config)
      p.render()
      expect(p.content).to.equal('This is the title, and this is the content')
    })
  })

})
