var expect = require('chai').expect
var _ = require('lodash-node/modern')

var config = require('../lib/config')
var originalConfig = _.clone(config)

describe('config', function() {

  describe('#set', function() {

    afterEach(function() {
      config.set(originalConfig)
    })

    it('merges the passed options with the config defaults', function() {
      config.set({
        source: './foo',
        destination: './bar',
        fizz: 'buzz'
      })

      expect(config.source).to.equal('./foo')
      expect(config.destination).to.equal('./bar')

      // a default
      expect(config.env).to.equal('production')

      // a new value
      expect(config.fizz).to.equal('buzz')
    })

    it('always includes certain default, even if overridden', function() {
      config.set({
        excludeFiles: ['foo'],
        watchExcludes: ['bar']
      })

      expect(config.excludeFiles).to.deep.equal([
        'foo',
        '_*',
        '_*/**/*',
        'package.json',
        'node_modules/**/*'
      ])

      expect(config.watchExcludes).to.deep.equal([
        'bar',
        'node_modules',
        config.destination
      ])
    })

  })

})
