var fs = require('fs-extra')
var expect = require('chai').expect
var _ = require('lodash-node/modern')

var Post = require('../lib/post')
var File = require('../lib/file')
var Taxonomy = require('../lib/taxonomy')
var posts = fs.readJSONSync('test/fixtures/posts.json')

// init config with the `tag` taxonomy
var config = require('../lib/config').init()
var originalConfig = _.clone(config)

describe('Post', function() {

  beforeEach(function() {
    // update the config just for this text
    config.taxonomyTypes = ['tag']
  })

  afterEach(function() {
    // restore the config
    config.taxonomyTypes = originalConfig.taxonomyTypes
  })

  describe('#init', function() {
    it('can initialize a new post from an object', function() {
      var p = new Post(posts[0])
      expect(p.title).to.equal('The 1st Recipe')
      expect(p.type).to.equal('recipe')
      expect(p.date).to.equal('2013-01-01T12:34:56-08:00')
      expect(p.tags).to.deep.equal(['red', 'green'])
      expect(p.content).to.equal('This is the content of the first recipe')
    })

    it('can initialize a new post from a file instance', function() {
      var f = new File('test/fixtures/post.md')
      // stub out the layout because we're not in the build context
      delete f.data.layout

      var p = new Post(f, 'post')
      expect(p.title).to.equal('Post Test')
      expect(p.type).to.equal('post')
      expect(p.date).to.equal('2013-10-03T12:34:56-08:00')
      expect(p.tags).to.deep.equal(['foo', 'bar', 'fizz', 'buzz'])
      expect(p.content.trim()).to.equal('Post test content.')
    })
  })

  describe('#registerTaxonomies', function() {
    it('creates taxonomy objects for each taxonomy on the post', function() {

      var p = new Post(posts[0])
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
      })
      p.render()
      expect(p.content).to.equal('This is the title, and this is the content')
    })
  })

})
