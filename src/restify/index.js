const restify = require('restify');
const bunyan = require('bunyan');
const WebpackResources = require('./resources.js');
const ListData = require('./storage/lists.js');

// Restify Plugins
const classifyBrowser = require('./plugins/classifyBrowser.js');
const setRequestResources = require('./plugins/setRequestResources.js');
const preloads = require('./plugins/preloads.js');

// Routes
const apiTopRoute = require('./routes/api/top-stories.js');
const apiNewRoute = require('./routes/api/new-stories.js');
const apiItemsRoute = require('./routes/api/items.js');
const defaultRoute = require('./routes/default.js');

// Server Constants
const APPLICATION_NAME = 'hn-web';
const logger = bunyan.createLogger({
  name: APPLICATION_NAME
});
const browserResources = WebpackResources(logger);

const server = restify.createServer({
  name: APPLICATION_NAME,
  log: logger
});
server.use(restify.requestLogger());
server.use(restify.bodyParser());
server.use(restify.queryParser());
server.use(classifyBrowser());
server.use(setRequestResources(browserResources));
server.use(preloads());

// TODO: Do not duplicate route definitions...
// Programatically derive from a single source of truth.
server.get('/api/top', apiTopRoute);
server.get('/api/items', apiItemsRoute);
server.get('/api/new', apiNewRoute);
server.get('/', defaultRoute);
server.get('/top', defaultRoute);
server.get('/top/.*', defaultRoute);
server.get('/new', defaultRoute);
server.get('/new/.*', defaultRoute);
server.get('/item/.*', defaultRoute);

// Prefetch Data for API.
const successfulTopUpdate = () => setTimeout(ListData.update, 600000, 'top', logger, {successfulTopUpdate, errorTopUpdate});
const errorTopUpdate = () => setTimeout(ListData.update, 600000, 'top', logger, {successfulTopUpdate, errorTopUpdate});
ListData.update('top', logger, {successfulNewUpdate, errorNewUpdate});

// Time to abstract.... 
// Now more than one timeout and now over requesting even when item in memory from less than a second ago.
const successfulNewUpdate = () => setTimeout(ListData.update, 600000, 'new', logger, {successfulNewUpdate, errorNewUpdate});
const errorNewUpdate = () => setTimeout(ListData.update, 600000, 'new', logger, {successfulNewUpdate, errorNewUpdate});
ListData.update('new', logger, {successfulNewUpdate, errorNewUpdate});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
