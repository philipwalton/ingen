var fs = require('fs-extra')
var expect = require('chai').expect
var Page = require('../lib/page')
var Post = require('../lib/post')
var File = require('../lib/file')

// init config with the `tag` taxonomy
var config = require('../lib/config').init({
  layoutsDirectory: 'test/src/_layouts',
  destination: 'test/src/_site/'
})

var pages = [
  {
    title: 'First Page',
    permalink: '/:title',
    layout: 'default'
  },
  {title: 'Second Page'},
  {title: 'Third Page'}
]

var posts = fs.readJSONSync('test/fixtures/posts.json')

describe('Page', function() {

  afterEach(function() {
    Page.reset()
  })

  describe('.all', function() {
    it('returns an array of all existing pages', function() {
      new Page(pages[0])
      new Page(pages[1])
      new Page(pages[2])
      expect(Page.all().length).to.equal(3)
      expect(Page.all()[0].title).to.equal('First Page')
      expect(Page.all()[1].title).to.equal('Second Page')
      expect(Page.all()[2].title).to.equal('Third Page')
    })
  })

  describe('.each', function() {
    it('accepts a function, iterates over each page, and calls the function with the page as its argument', function() {
      new Page(pages[0])
      new Page(pages[1])
      new Page(pages[2])
      Page.each(function(page, i) {
        expect(page.title).to.equal(pages[i].title)
      })
    })
  })

  describe('.reset', function() {
    it('restores the page list to an empty array', function() {
      new Page(pages[0])
      new Page(pages[1])
      new Page(pages[2])
      expect(Page.all().length).to.equal(3)
      Page.reset()
      expect(Page.all().length).to.equal(0)
    })
  })

  describe('#init', function() {
    it('can initialize a new page from an object', function() {
      var p = new Page(pages[0])
      expect(p.title).to.equal('First Page')
      expect(p.layout).to.equal('default')
      expect(p.permalink.toString()).to.equal('/first-page/')
    })
    it('can initialize a new page from a file instance', function() {
      var file = File.getOrCreate('test/src/_pages/index.html')
      var p = new Page(file)
      expect(p.title).to.equal('Home')
      expect(p.layout).to.equal('default')
      expect(p.permalink.toString()).to.equal('/')
    })
    it('can initialize a new page from a post instance', function() {
      var post = new Post(posts[0])
      var p = new Page(post)
      expect(p.title).to.equal('First Post')
      expect(p.type).to.equal('post')
    })
  })

})