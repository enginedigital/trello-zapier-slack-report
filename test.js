require('es6-promise').polyfill();
require('isomorphic-fetch');

// set this globally to make sure the functions get it
global.inputData = require('./credentials.json');

require('./index.js');
