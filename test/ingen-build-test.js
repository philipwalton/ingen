var fs = require('fs')
var path = require('path')
var expect = require('chai').expect
var shell = require('shelljs')
var glob = require('glob')
var _ = require('lodash')

function read(filename) {
  return fs.readFileSync(filename, 'utf8')
}

function fixture(name) {
  return read('test/fixtures/' + name + '.html')
}

function clean() {
  shell.rm('-rf', 'test/src/_site');
}

function filesOnly(file) {
  return fs.statSync(file).isFile()
}

describe('ingen', function() {

  beforeEach(clean)
  // after(clean)

  describe('build', function() {
    it('should build the site', function(done) {
      var spawn = require('child_process').spawn
      var child = spawn('ingen', ['build'], {cwd: 'test/src'})

      child.on('close', function() {
        var generatedFiles = _.filter(glob.sync('test/src/_site/**/*'), filesOnly)
        var expectedFiles = _.filter(glob.sync('test/expected/**/*'), filesOnly)

        expect(expectedFiles.length).to.equal(generatedFiles.length)

        _.times(expectedFiles.length, function(i) {
          // remove trailing whitespace before comparing
          var expected = read(expectedFiles[i]).replace(/\s*\n/g, '\n')
          var generated = read(generatedFiles[i]).replace(/\s*\n/g, '\n')
          expect(expected).to.equal(generated)
        })

        done()
      })

    })
  })

})
