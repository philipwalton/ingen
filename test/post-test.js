var fs = require('fs-extra')
var expect = require('chai').expect
var Post = require('../lib/post')
var File = require('../lib/file')
var Taxonomy = require('../lib/taxonomy')
var posts = fs.readJSONSync('test/fixtures/posts.json')

// init config with the `tag` taxonomy
var config = require('../lib/config').init({taxonomyTypes: ['tag']})

describe('Post', function() {

  afterEach(function() {
    Post.reset()
  })

  describe('.all', function() {
    it('returns an array of all existing posts', function() {
      new Post(posts[0])
      new Post(posts[1])
      new Post(posts[2])
      expect(Post.all().length).to.equal(3)
      expect(Post.all()[0].title).to.equal('First Post')
      expect(Post.all()[1].title).to.equal('Second Post')
      expect(Post.all()[2].title).to.equal('Third Post')
    })
  })

  describe('.each', function() {
    it('accepts a function, iterates over each post, and calls the function with the post as its argument', function() {
      new Post(posts[0])
      new Post(posts[1])
      new Post(posts[2])
      Post.each(function(post, i) {
        expect(post.title).to.equal(posts[i].title)
      })
    })
  })

  describe('.reset', function() {
    it('restores the post list to an empty array', function() {
      new Post(posts[0])
      new Post(posts[1])
      new Post(posts[2])
      expect(Post.all().length).to.equal(3)
      Post.reset()
      expect(Post.all().length).to.equal(0)
    })
  })

  describe('#init', function() {
    it('can initialize a new post from an object', function() {
      var p = new Post(posts[0])
      expect(p.title).to.equal('First Post')
      expect(p.type).to.equal('post')
      expect(p.date).to.equal('2013-01-01T12:34:56-08:00')
      expect(p.tags).to.deep.equal(['red', 'green'])
      expect(p.content).to.equal('This is the content of the first post')
    })

    it('can initialize a new post from a file instance', function() {
      var f = new File('test/src/_articles/article-one.md')
      // stub out the layout because we're not in the build context
      delete f.data.layout

      var p = new Post(f, 'article')
      expect(p.title).to.equal('Article One')
      expect(p.type).to.equal('article')
      expect(p.date).to.equal('2013-10-03T12:34:56-08:00')
      expect(p.tags).to.deep.equal(['foo', 'bar', 'fizz', 'buzz'])
      expect(p.content.trim()).to.equal('Article one text.')
    })
  })

  describe('#registerTaxonomies', function() {
    it('creates taxonomy objects for each taxonomy on the post', function() {

      debugger
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
    it('renders the post content with any post or template data', function() {
      var p = new Post({
        title: "This is the title",
        content: "{{title}}, and this is the content"
      })
      p.render()
      expect(p.content).to.equal('This is the title, and this is the content')
    })
  })

})
