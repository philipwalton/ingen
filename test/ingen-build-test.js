var fs = require('fs')
  , path = require('path')
  , expect = require('chai').expect
  , shell = require('shelljs')
  , glob = require('glob')
  , _ = require('lodash')

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
        , child = spawn('ingen', ['build'], {cwd: 'test/src'})

      child.on('close', function() {
        var generatedFiles = _.filter(glob.sync('test/src/_site/**/*'), filesOnly)
          , expectedFiles = _.filter(glob.sync('test/expected/**/*'), filesOnly)

        expect(expectedFiles.length).to.equal(generatedFiles.length)

        _.times(expectedFiles.length, function(i) {
          // remove trailing whitespace before comparing
          var expected = read(expectedFiles[i]).replace(/\s*\n/g, '\n')
            , generated = read(generatedFiles[i]).replace(/\s*\n/g, '\n')
          expect(expected).to.equal(generated)
        })

        done()
      })

    })
  })

})