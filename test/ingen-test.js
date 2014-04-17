var fs = require('fs-extra');
var path = require('path');
var expect = require('chai').expect;
var shell = require('shelljs');
var glob = require('glob');
var diffChars = require('diff').diffChars;
var _ = require('lodash-node/modern');

var nonwhitespace = /\S/;

function read(filename) {
  return fs.readFileSync(filename, 'utf8');
}

function fixture(name) {
  return read('test/fixtures/' + name + '.html');
}

function clean() {
  // clear the generated site directory
  shell.rm('-rf', 'test/src/complex/_site');

  // remove any .DS_Store files from the expected directory
  _.each(glob.sync('test/expected/complex/**/.DS_Store'), function(file) {
    fs.removeSync(file);
  });
}

function filesOnly(file) {
  return fs.statSync(file).isFile();
}

function containsNonWhiteSpaceDiffs(a, b) {
  var diffs = diffChars(a, b);
  for (var i = 0, diff; diff = diffs[i]; i++) {
    if ((diff.added || diff.removed) && nonwhitespace.test(diff.value)) {
      return true;
    }
  }
  return false;
}

describe('ingen', function() {

  beforeEach(clean);

  after(clean);

  describe('build', function() {

    it('should build a complex site');

    it('should build a complex site', function(done) {

      var spawn = require('child_process').spawn;
      var child = spawn('../../../bin/ingen', ['build'], {cwd: 'test/src/complex'});

      child.on('close', function() {
        var generatedFiles = _.filter(glob.sync('test/src/complex/_site/**/*', {dot:true}), filesOnly);
        var expectedFiles = _.filter(glob.sync('test/expected/complex/**/*',{dot:true}), filesOnly);

        expect(expectedFiles.length).to.equal(generatedFiles.length);

        _.times(expectedFiles.length, function(i) {
          var expected = read(expectedFiles[i]);
          var generated = read(generatedFiles[i]);
          if (containsNonWhiteSpaceDiffs(expected, generated)) {
            expect(expected).to.equal(generated);
          }
        });

        done();
      });

    });
  });

});

