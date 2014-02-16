var expect = require('chai').expect
var File = require('../lib/file')

describe('File', function() {

  describe('.getOrCreate', function() {
    it('returns a new instance'
        + 'unless one already exists at that locations', function() {

      var f = File.getOrCreate('test/fixtures/file.html')
      expect(f.filename).to.equal('test/fixtures/file.html')
      expect(f.content.trim()).to.equal('File contents.\n\n'
          + 'Additional contents...')

      expect(f.data).to.deep.equal({
        string: 'foobar',
        number: 42,
        array: [1, 2, 3],
        object: {
          testing: '1, 2, 3...'
        }
      })
    })
  })

})
