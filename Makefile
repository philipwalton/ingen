export PATH := ./node_modules/.bin:$(PATH)

test:
	mocha --reporter spec

.PHONY: test
