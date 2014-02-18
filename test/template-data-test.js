var expect = require('chai').expect
var _ = require('lodash-node/modern')

var templateData = require('../lib/template-data')

describe('template-data', function() {

  it('by default contains the site config data', function() {
    expect(Object.keys(templateData)).to.deep.equal(['site'])
  })

})
