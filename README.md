InGen
=====

## Features

* Custom content types
  * registered in the _config.json
  * residing in a directory of the content type name (_posts, _pages, _articles)
* Custom taxonomy types
  * also registered in the _config.json
  * like tags or categories
* Pagination
  * unlike Jekyll which only has pagination on the home page, InGen can paginate any page that registered pagination
  * in the page head-data, simply set the pagination key to a numerical value representing the number of content types on that page
* Event driven
  * handlers can be added to transform content or create additional content at any point in the build cycle


Events
======

* `ingen build`
* Create a `site` object that will hold all the content data
* Read config file
* Scan directories and gather all custom content data
* Scan directories for all static files (non-custom content) that need to be copied
* Meta program helper functions to iterate through all of the content data
* Transform all files that contain `bundled data` (aka YAML front matter)
* Render transformed files to the destination directory
* Copy static files to the destination directory
* done!


Objects
=======

* Site (has many Files)
* File (belongs to Site)
* Transformer
* Permalink (date stuff)

## File

* files with JSON data at the beginning are always transformed
* files matching a pattern may be transformed (e.g. *.css w/ autoprefixer)
* all other files are simply copied

## Transformer

* Used to convert a file from one format to another
  * matches (detect matching extension)
  * outputExt (define an output extension)
  * transform (the logic that converts the file)
* Used to transform the contents of a file (like autoprefix the css)

Handlebars Helpers
==================

* http://elving.github.io/swag/
* http://assemble.io/helpers/


