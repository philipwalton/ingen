var assert = require('assert');
var Template = require('../lib/template');
var Config = require('../lib/config');

describe('Template', function() {

  var config = new Config({
    layoutsDirectory: 'test/fixtures'
  });

  describe('#constructor', function() {

    it('creates a new file instance from a filename '
        + 'and config object', function() {

      var filename = 'test/fixtures/file-child.html'
      var file = new Template(filename, config);

      assert.equal(file.filename, filename);
      assert.equal(file.content.trim(), 'File contents.');
      assert.equal(file.config, config);
    })

    it('creates a new file instance from a data object, content '
        + 'and config object', function() {

      var data = { foo: 'bar', fizz: 'buzz' }
      var content = 'This is the content.'
      var file = new Template(data, content, config);

      assert.equal(file.data, data);
      assert.equal(file.content.trim(), content);
      assert.equal(file.config, config);
    })

    it('merges its data with the data '
        + 'all the way up its layout chain.', function() {

      var data = {
        layout: 'file-parent',
        foo: 'foo from data',
        query: {
          type: 'post'
        }
      };
      var file1 = new Template('test/fixtures/file-child.html', config);
      var file2 = new Template(data, '', config);

      assert.deepEqual(file1.data, {
        layout: 'file-parent',
        foo: 'foo from child',
        bar: 'foo from parent',
        query: {
          type: 'article',
          limit: 6
        }
      });
      assert.deepEqual(file2.data, {
        layout: 'file-parent',
        foo: 'foo from data',
        bar: 'foo from parent',
        query: {
          type: 'post',
          limit: 6
        }
      });
    });

  });

  describe('.getOrCreateFromFile', function() {

    it('returns a new instance '
        + 'unless one already exists at that location', function() {

      var f1 = Template.getOrCreateFromFile('test/fixtures/file.html', config);
      var f2 = Template.getOrCreateFromFile('test/fixtures/file.html', config);

      assert.equal(f2, f1);
    });

  });

});
