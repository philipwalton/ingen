var fs = require('fs-extra')
var path = require('path')
var expect = require('chai').expect
var _ = require('lodash-node/modern')

var Page = require('../lib/page')
var Post = require('../lib/post')
var Template = require('../lib/template')
var Site = require('../lib/site')

var site

var pages = [
  {
    title: 'First Page',
    permalink: '/:title',
    layout: 'default'
  },
  {title: 'Second Page'},
  {title: 'Third Page'},
  {
    title: 'Paginated Page',
    permalink: '/:title',
    layout: 'default',
    query: {
      type: 'article',
      limit: 2
    }
  }
]

var posts = fs.readJSONSync('test/fixtures/posts.json')

describe('Page', function() {

  before(function() {
    site = new Site({
      destination: 'test/_tmp',
      layoutsDirectory: 'test/fixtures'
    })
    site._registerPartials()
  })

  after(function() {
    fs.removeSync(site.config.destination)
  })

  beforeEach(function() {
    Page.reset()
  })

  afterEach(function() {
    Page.reset()
  })

  describe('.all', function() {
    it('returns an array of all existing pages', function() {
      new Page(pages[0], site.config)
      new Page(pages[1], site.config)
      new Page(pages[2], site.config)
      expect(Page.all().length).to.equal(3)
      expect(Page.all()[0].title).to.equal('First Page')
      expect(Page.all()[1].title).to.equal('Second Page')
      expect(Page.all()[2].title).to.equal('Third Page')
    })
  })

  describe('.each', function() {
    it('accepts a function, iterates over each page, '
        + 'and calls the function with the page as its argument', function() {
      new Page(pages[0], site.config)
      new Page(pages[1], site.config)
      new Page(pages[2], site.config)
      Page.each(function(page, i) {
        expect(page.title).to.equal(pages[i].title)
      })
    })
  })

  describe('.reset', function() {
    it('restores the page list to an empty array', function() {
      new Page(pages[0], site.config)
      new Page(pages[1], site.config)
      new Page(pages[2], site.config)
      expect(Page.all().length).to.equal(3)
      Page.reset()
      expect(Page.all().length).to.equal(0)
    })
  })

  describe('#init', function() {
    it('can initialize a new page from an object', function() {
      var p = new Page(pages[0], site.config)
      expect(p.title).to.equal('First Page')
      expect(p.layout).to.equal('default')
      expect(p.permalink.toString()).to.equal('/first-page/')
    })
    it('can initialize a new page from a file instance', function() {
      var file = Template.getOrCreateFromFile('test/fixtures/page.html', site.config)
      var p = new Page(file, site.config)
      expect(p.title).to.equal('Test Page')
      expect(p.layout).to.equal('default')
      expect(p.permalink.toString()).to.equal('/test-page/')
    })
    it('can initialize a new page from a post instance', function() {
      var post = new Post(posts[0], site.config)
      var p = new Page(post, site.config)
      expect(p.title).to.equal('The 1st Recipe')
      expect(p.type).to.equal('recipe')
    })
  })

  describe('#paginate', function() {
    it('creates additional pages based on the query', function() {
      var p = new Page(pages[3], site.config)
      p.paginate(posts)

      expect(Page.all().length).to.equal(3)
    })
  })

  describe('#render', function() {
    it('renders the page content with any template data', function() {
      var p = new Page({
        title: 'This is the title',
        content: 'This is the {{page.foobar}}',
        layout: 'default',
        foobar: 'FooBar'
      }, site.config)
      p.render()

      expect(p.content.indexOf('This is the FooBar')).to.not.equal(-1)
    })
  })

  describe('#write', function() {
    it('write a rendered page to the permalink location', function() {
      var p = new Page({
        title: 'This is the title',
        content: 'This is the {{page.foobar}}',
        layout: 'default',
        foobar: 'FooBar'
      }, site.config)
      p.render()
      p.write()

      var output = fs.readFileSync(
          path.join(site.config.destination, 'this-is-the-title/index.html'),
          'utf-8'
      )
      expect(output.indexOf('This is the FooBar')).to.not.equal(-1)
    })
  })

})
