var expect = require('chai').expect
  , Permalink = require('../lib/permalink')

describe('Permalink', function() {

  describe('#toString', function() {

    it('should resolve a permalink object and return it as a string', function() {
      var p = new Permalink('sub-directory/:title.html', {
        title: 'Foo to the Bar',
        date: '2013-06-13'
      })
      expect(p.toString()).to.equal('/sub-directory/foo-to-the-bar.html')
    })

    it('adds a trailing slash if the permalink does end with `.html`', function() {
      var p = new Permalink('foo.html')
      expect(p.toString()).to.equal('/foo.html')
      var p = new Permalink('foo')
      expect(p.toString()).to.equal('/foo/')
      var p = new Permalink('foo.bar')
      expect(p.toString()).to.equal('/foo.bar/')
    })

    it('can replace `:title` with a url-friendly post\'s title', function() {
      var p = new Permalink(':title', {title: 'Foo to the Bar'})
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
      var p = new Permalink(':year/foo', {date: '2013/09/15'})
      expect(p.toString()).to.equal('/2013/foo/')
    })

    it('can replace `:month` with the month of the post\'s publication date', function() {
      var p = new Permalink(':month/bar', {date: '2013/09/15'})
      expect(p.toString()).to.equal('/09/bar/')
    })

    it('can replace `:day` with the day of the post\'s publication date', function() {
      var p = new Permalink(':day/fizz', {date: '2013/09/15'})
      expect(p.toString()).to.equal('/15/fizz/')
    })

    it('can can handle multiple replacements', function() {
      var p = new Permalink('path/to/:type/:year/:month/:day/:title', {
        title: 'This is the title',
        type: 'article',
        date: '2013/09/15'
      })
      expect(p.toString()).to.equal('/path/to/articles/2013/09/15/this-is-the-title/')
    })

    it('can can handle complex titles', function() {
      var p = new Permalink(':title', {
        title: 'My title\'s got $pecial+characters~ in.it'
      })
      expect(p.toString()).to.equal('/my-titles-got-pecialcharacters~-in.it/')
    })

  })

})