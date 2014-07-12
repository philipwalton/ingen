var fs = require('fs-extra');
var path = require('path');
var assert = require('assert');
var expect = require('chai').expect;
var _ = require('lodash-node/modern');

var Page = require('../lib/page');
var Post = require('../lib/post');
var Template = require('../lib/template');
var Site = require('../lib/site');
var Config = require('../lib/config');

var site;
var config = new Config();

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
];

var postData = fs.readJSONSync('test/fixtures/posts.json');
var posts = postData.map(function(post) {
  return new Post(post, config);
});

describe('Page', function() {

  before(function() {
    site = new Site({
      destination: 'test/_tmp',
      layoutsDirectory: 'test/fixtures'
    });
    site._registerPartials();
  });

  after(function() {
    fs.removeSync(site.config.destination);
  });

  beforeEach(Page.reset);
  after(Page.reset);

  describe('.all', function() {
    it('returns an array of all existing pages', function() {
      new Page(pages[0], site.config);
      new Page(pages[1], site.config);
      new Page(pages[2], site.config);
      expect(Page.all().length).to.equal(3);
      expect(Page.all()[0].template.data.title).to.equal('First Page');
      expect(Page.all()[1].template.data.title).to.equal('Second Page');
      expect(Page.all()[2].template.data.title).to.equal('Third Page');
    });
  });

  describe('.each', function() {
    it('accepts a function, iterates over each page, '
        + 'and calls the function with the page as its argument', function() {
      new Page(pages[0], site.config);
      new Page(pages[1], site.config);
      new Page(pages[2], site.config);
      Page.each(function(page, i) {
        expect(page.template.data.title).to.equal(pages[i].title);
      });
    });
  });

  describe('.reset', function() {
    it('restores the page list to an empty array', function() {
      new Page(pages[0], site.config);
      new Page(pages[1], site.config);
      new Page(pages[2], site.config);
      expect(Page.all().length).to.equal(3);
      Page.reset();
      expect(Page.all().length).to.equal(0);
    });
  });

  describe('#init', function() {

    it('can initialize a new page from a post instance', function() {
      var post = posts[0];
      var page = new Page(post, site.config);
      assert.equal(page.post, post);
      assert.equal(page.template, post.template);
      assert.equal(page.permalink.toString(), '/the-1st-recipe/');
      assert.equal(page.template.data.title, 'The 1st Recipe');
    });

    it('can initialize a new page from a template instance', function() {
      var template = new Template('test/fixtures/page.html', site.config);
      var page = new Page(template, site.config);
      assert.equal(page.template, template);
      assert.equal(page.permalink.toString(), '/test-page/');
      assert.equal(page.template.data.title, 'Test Page');
    });

    it('can initialize a new page from an object', function() {
      var page = new Page(pages[0], site.config);
      assert.equal(page.permalink.toString(), '/first-page/');
      assert.equal(page.template.data.title, pages[0].title);
      assert.equal(page.template.data.layout, pages[0].layout);
      assert.equal(page.template.data.title, pages[0].title);
    });

    it('uses the post\'s permalink if one exists', function() {
      var post = posts[0];
      var page = new Page(post, site.config);
      assert.equal(post.permalink, page.permalink);
    });

    it('sets hidden getter links for some taxonomy properties', function() {
      var template = new Template('test/fixtures/page.html', site.config);
      var page = new Page(template, site.config);

      assert.equal(page.title, page.template.data.title);
      assert.equal(page.date, page.template.data.date);
      assert.equal(page.format, page.template.format);
      assert.equal(page.filename, page.template.filename);
    });

  });

  describe('#clone', function() {
    it('can clone a page that was created from an object', function() {
      var page = new Page(pages[0], site.config);
      var clone = page.clone();

      assert.equal(clone.title, page.title);
      assert.equal(clone.permalink.toString(), page.permalink.toString());
      assert.equal(clone.permalink, page.permalink);
      assert.equal(clone.template, page.template);
      assert.notEqual(clone, page);
    });

    it('can clone a page that was created from a template', function() {
      var template = new Template('test/fixtures/page.html', site.config);
      var page = new Page(template, site.config);
      var clone = page.clone();

      assert.equal(clone.title, page.title);
      assert.equal(clone.permalink.toString(), page.permalink.toString());
      assert.equal(clone.permalink, page.permalink);
      assert.equal(clone.template, page.template);
      assert.notEqual(clone, page);
    });

    it('can clone a page that was created from a post', function() {
      var post = posts[0];
      var page = new Page(post, site.config);
      var clone = page.clone();

      assert.equal(clone.title, page.title);
      assert.equal(clone.permalink.toString(), page.permalink.toString());
      assert.equal(clone.permalink, page.permalink);
      assert.equal(clone.template, page.template);
      assert.equal(clone.post, page.post);
      assert.notEqual(clone, page);
    });
  });

  describe('#paginate', function() {
    it('creates additional pages based on the query', function() {
      var page = new Page(pages[3], site.config);
      page.paginate(posts);

      var paginatedPages = Page.all();
      assert.equal(paginatedPages.length, 3);

      assert(paginatedPages[0].paginated);
      assert.equal(paginatedPages[0].nextPage, paginatedPages[1]);
      assert.equal(paginatedPages[0].prevPage, false);

      assert(paginatedPages[1].paginated);
      assert.equal(paginatedPages[1].nextPage, paginatedPages[2]);
      assert.equal(paginatedPages[1].prevPage, paginatedPages[0]);

      assert(paginatedPages[2].paginated);
      assert.equal(paginatedPages[2].nextPage, false);
      assert.equal(paginatedPages[2].prevPage, paginatedPages[1]);
    });
  });

  describe('#render', function() {
    it('renders the page content with any template data', function() {
      var p = new Page({
        title: 'This is the title',
        content: 'This is the {{foobar}}',
        layout: 'default',
        foobar: 'FooBar'
      }, site.config);
      p.render();

      assert(p.content.indexOf('This is the FooBar') > -1);
    });
  });

  describe('#write', function() {
    it('write a rendered page to the permalink location', function() {
      var p = new Page({
        title: 'This is the title',
        content: 'This is the {{foobar}}',
        layout: 'default',
        foobar: 'FooBar'
      }, site.config);
      p.render();
      p.write();

      var outputFile = path.join(site.config.destination, 'this-is-the-title/index.html');
      var output = fs.readFileSync(outputFile, 'utf-8');
      assert(output.indexOf('This is the FooBar') > -1);
    });
  });

});
