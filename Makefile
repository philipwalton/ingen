mods := ./node_modules
bins := ./node_modules/.bin
src := bin/ingen lib/*.js plugins/*.js plugins/handlebars-helpers/*.js
test := test/*.js

all: lint test

lint: $(src) $(test)
	@ $(bins)/jshint --verbose $^

test:
	@node_modules/.bin/mocha --no-colors --reporter spec

.PHONY: lint test
