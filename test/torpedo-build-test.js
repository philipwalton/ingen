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

function readGenerated(filename, destination) {
  var loc = path.resolve(destination || '_site', filename)
  return read(loc, 'utf8').trim()
}

function readExpected(filename) {
  var loc = path.resolve('../expected', filename)
  return read(loc, 'utf8').trim()
}

function clean() {
  shell.rm('-rf', '_site');
}

function filesOnly(file) {
  return fs.statSync(file).isFile()
}

describe('torpedo', function() {

  beforeEach(clean)
  after(clean)

  describe('build', function() {
    it('should build the site', function(done) {
      var spawn = require('child_process').spawn
        , child = spawn('torpedo', ['build'], {cwd: 'test/src'})

      child.on('close', function() {
        var generatedFiles = glob.sync('test/src/_site/**/*').filter(filesOnly)
          , expectedFiles = glob.sync('test/expected/**/*').filter(filesOnly)

        _.times(expectedFiles.length, function(i) {
          expect(read(expectedFiles[i])).to.equal(read(generatedFiles[i]))
        })

        done()
      })

    })
  })

})