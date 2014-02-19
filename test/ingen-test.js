var fs = require('fs-extra')
var path = require('path')
var expect = require('chai').expect
var shell = require('shelljs')
var glob = require('glob')
var _ = require('lodash-node/modern')

function read(filename) {
  return fs.readFileSync(filename, 'utf8')
}

function fixture(name) {
  return read('test/fixtures/' + name + '.html')
}

function clean() {
  // clear the generated site directory
  shell.rm('-rf', 'test/src/_site')

  // remove any .DS_Store files from the expected directory
  _.each(glob.sync('test/expected/**/.DS_Store'), function(file) {
    fs.removeSync(file)
  })
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
      var child = spawn('../../bin/ingen', ['build'], {cwd: 'test/src'})

      child.on('close', function() {
        var generatedFiles = _.filter(glob.sync('test/src/_site/**/*', {dot:true}), filesOnly)
        var expectedFiles = _.filter(glob.sync('test/expected/**/*',{dot:true}), filesOnly)

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

