mods := ./node_modules
bins := ./node_modules/.bin
src := bin/ingen lib/*.js plugins/*.js plugins/handlebars-helpers/*.js
test := test/*.js

all: install lint test

install:
	@ npm install

lint: $(src) $(test)
	@ $(bins)/jshint --verbose $^

test:
	@node_modules/.bin/mocha --reporter spec

.PHONY: all install lint test
