var assert = require('assert');
var Template = require('../lib/template');
var Config = require('../lib/config');
var Permalink = require('../lib/permalink');

describe('Template', function() {

  var config = new Config({
    layoutsDirectory: 'test/fixtures'
  });

  describe('#constructor', function() {

    it('creates a new template instance from a filename '
        + 'and config object', function() {

      var filename = 'test/fixtures/template-child.html';
      var template = new Template(filename, config);

      assert.equal(template.filename, filename);
      assert.equal(template.content.trim(), 'Template contents.');
      assert.equal(template.config, config);
    });

    it('creates a new template instance from a data object, content '
        + 'and config object', function() {

      var data = { foo: 'bar', fizz: 'buzz' };
      var content = 'This is the content.';
      var template = new Template(data, content, config);

      assert.equal(template.data, data);
      assert.equal(template.content.trim(), content);
      assert.equal(template.config, config);
    });

    it('merges its data with the data '
        + 'all the way up its layout chain.', function() {

      var data = {
        layout: 'template-parent',
        foo: 'foo from data',
        query: {
          type: 'post'
        }
      };
      var template1 = new Template('test/fixtures/template-child.html', config);
      var template2 = new Template(data, '', config);

      assert.deepEqual(template1.data, {
        layout: 'template-parent',
        foo: 'foo from child',
        bar: 'foo from parent',
        query: {
          type: 'article',
          limit: 6
        }
      });
      assert.deepEqual(template2.data, {
        layout: 'template-parent',
        foo: 'foo from data',
        bar: 'foo from parent',
        query: {
          type: 'post',
          limit: 6
        }
      });
    });

  });

  describe('#renderContent', function() {
    it('renders the template content by itself');
  });

  describe('#renderLayout', function() {
    it('renders the template up the layout chain');
  });

  describe('.getOrCreateFromFile', function() {

    it('returns a new instance '
        + 'unless one already exists at that location', function() {

      var f1 = Template.getOrCreateFromFile('test/fixtures/template.html', config);
      var f2 = Template.getOrCreateFromFile('test/fixtures/template.html', config);

      assert.equal(f2, f1);
    });

  });

});
