require('es6-promise').polyfill();
require('isomorphic-fetch');

const { URL, URLSearchParams } = require('url');

// set this globally to make sure the functions get it
global.inputData = require('./credentials.json');

// polyfill the environment
global.URL = URL;
global.URLSearchParams = URLSearchParams;

require('./index.js');
