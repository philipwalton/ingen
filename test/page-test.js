var fs = require('fs-extra')
var expect = require('chai').expect
var Page = require('../lib/page')

// init config with the `tag` taxonomy
var config = require('../lib/config').init({})

var pages = [
  {title: 'First Page'},
  {title: 'Second Page'},
  {title: 'Third Page'}
]

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
    it('can initialize a new page from an object')
    it('can initialize a new page from a page instance')
  })

})
