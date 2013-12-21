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


## Constraints

* Posts cannot access data from other posts (to avoid circularity)
* Posts cannot use the query helper (again, to avoid circularity)
* Posts cannot paginate
* Posts cannot access data from up the layout chain (maybe in a future version)
* Posts can only access data from their header data as well as site config data

* Pages can access data from any number of posts
* Pages can use the query helper
* Pages can paginate
* Pages have access to header data all the way up the layout chain


## Handlebars Helpers

* http://elving.github.io/swag/
* http://assemble.io/helpers/


