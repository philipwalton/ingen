var connect = require('connect')

connect()
  .use(connect.logger('dev'))
  .use(connect.static('_site'))
  .listen(1234)
