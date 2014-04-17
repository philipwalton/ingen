var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');
var Config = require('../lib/config');


describe('config', function() {

  describe('#constructor', function() {

    it('creates a new object with the config defaults', function() {

      sinon.spy(Config.prototype, 'set');

      var options = {};
      var config = new Config(options);

      assert(Config.prototype.set.calledWith(options));
      Config.prototype.set.restore();
    });

    it('call .set with any passed options', function() {
      var config = new Config();
      expect(config.source).to.equal('.');
      expect(config.destination).to.equal('_site');
    });

  });

  describe('#set', function() {

    it('merges the passed options with the config defaults', function() {

      var config = new Config();

      config.set({
        source: './foo',
        destination: './bar',
        fizz: 'buzz'
      });

      expect(config.source).to.equal('./foo');
      expect(config.destination).to.equal('./bar');

      // a default
      expect(config.env).to.equal('production');

      // a new value
      expect(config.fizz).to.equal('buzz');
    });

    it('always includes certain default, even if overridden', function() {

      var config = new Config();

      config.set({
        excludeFiles: ['foo'],
        watchExcludes: ['bar']
      });

      expect(config.excludeFiles).to.deep.equal([
        'foo',
        '.*',
        '_*',
        '_*/**/*',
        'package.json',
        'bower_components',
        'node_modules'
      ]);

      expect(config.watchExcludes).to.deep.equal([
        'bar',
        'node_modules',
        config.destination
      ]);
    });

  });

});
