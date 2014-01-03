var expect = require('chai').expect
var Permalink = require('../lib/permalink')

// init config with the default options
var config = require('../lib/config').init({})

describe('Permalink', function() {

  describe('#toString', function() {

    it('should resolve a permalink object and return it as a string', function() {
      var p = new Permalink('sub-directory/:title.html', {
        title: 'Foo to the Bar',
        date: '2013-06-13'
      })
      expect(p.toString()).to.equal('/sub-directory/foo-to-the-bar.html')
    })

    it('adds a trailing slash if the permalink doesn\'t have an extension', function() {
      var p = new Permalink('foo.html')
      expect(p.toString()).to.equal('/foo.html')
      var p = new Permalink('foo')
      expect(p.toString()).to.equal('/foo/')
      var p = new Permalink('foo.bar')
      expect(p.toString()).to.equal('/foo.bar')
    })

    it('can replace `:title` with a url-friendly post\'s title', function() {
      var p = new Permalink(':title', {title: 'Foo to the Bar'})
      expect(p.toString()).to.equal('/foo-to-the-bar/')
    })

    it('can replace `:filename` with the filename excluding the directory path or extension', function() {
      var p = new Permalink(':filename', {filename: '_posts/foo-to-the-bar.html'})
      expect(p.toString()).to.equal('/foo-to-the-bar/')
    })

    it('can replace `:type` with the plural form of the post\'s type', function() {
      var p = new Permalink(':type/:title', {
        title: 'Foo to the Bar',
        type: 'post'
      })
      expect(p.toString()).to.equal('/posts/foo-to-the-bar/')
    })

    it('can replace `:year` with the year of the post\'s publication date', function() {
      var p = new Permalink(':year/foo', {date: '2013-09-15T12:34:56-08:00'})
      expect(p.toString()).to.equal('/2013/foo/')
    })

    it('can replace `:month` with the month of the post\'s publication date', function() {
      var p = new Permalink(':month/bar', {date: '2013-09-15T12:34:56-08:00'})
      expect(p.toString()).to.equal('/09/bar/')
    })

    it('can replace `:day` with the day of the post\'s publication date', function() {
      var p = new Permalink(':day/fizz', {date: '2013-09-15T12:34:56-08:00'})
      expect(p.toString()).to.equal('/15/fizz/')
    })

    it('can replace `:pagenum` with the page\'s page number', function() {
      var p = new Permalink('page/:pagenum', {pagenum: 3})
      expect(p.toString()).to.equal('/page/3/')
    })

    it('can can handle multiple replacements', function() {
      var p = new Permalink('path/to/:type/:year/:month/:day/:title/:filename/page/:pagenum', {
        title: 'This is the title',
        filename: '_posts/my-file.html',
        type: 'article',
        date: '2013-09-15T12:34:56-08:00',
        pagenum: 2
      })
      expect(p.toString()).to.equal('/path/to/articles/2013/09/15/this-is-the-title/my-file/page/2/')
    })

    it('can can handle complex titles', function() {
      var p = new Permalink(':title', {
        title: 'My title\'s got $pecial+characters~ in.it'
      })
      expect(p.toString()).to.equal('/my-titles-got-pecialcharacters~-in.it/')
    })

  })

  describe('#append', function() {

    it('can append directories to the permalink', function() {
      var p = new Permalink('sub-directory/:title', {
        title: 'Foo to the Bar',
        date: '2013-06-13T12:34:56-08:00'
      })
      p.append('page/:pagenum')
      expect(p.permalink).to.equal('/sub-directory/:title/page/:pagenum')
    })

    it('accounts for permalinks that end with a file instead of a directory', function() {
      var p = new Permalink('sub-directory/:title.html', {
        title: 'Foo to the Bar',
        date: '2013-06-13T12:34:56-08:00'
      })
      p.append('page/:pagenum')
      expect(p.permalink).to.equal('/sub-directory/page/:pagenum/:title.html')
    })

  })

  describe('#clone', function() {

    it('returns a new instance with all the same properties', function() {
      var original = new Permalink('sub-directory/:title', {
        title: 'Foo to the Bar',
        date: '2013-06-13T12:34:56-08:00',
        pagenum: 2,
        type: 'article'
      })
      var clone = original.clone()

      expect(clone).not.to.equal(original)
      expect(clone.title).to.equal(original.title)
      expect(clone.type).to.equal(original.type)
      expect(clone.pagenum).to.equal(original.pagenum)
      expect(clone.date.format('YYYY-MM-DD')).to.equal(original.date.format('YYYY-MM-DD'))
    })

  })

  describe('#replace', function() {

    it('can do a regex replace on it\'s `_permalink` property', function() {
      var p = new Permalink('sub-directory/:title', {
        title: 'Foo to the Bar',
        date: '2013-06-13T12:34:56-08:00'
      })
      p.replace(/r/g, 'w')
      expect(p.permalink).to.equal('/sub-diwectowy/:title/')
    })

  })

})