var EventEmitter = require('events').EventEmitter;
var expect = require('chai').expect;

var events = require('../lib/events');

describe('events', function() {
  it('is an event emitter', function() {
    expect(events instanceof EventEmitter).to.be.ok;
  });
});
