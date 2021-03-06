/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function (app) {

    // Insert routes below
    app.use('/api/things', require('./api/thing'));
    app.use('/api/users', require('./api/user'));
    app.use('/api/manufacturers', require('./api/manufacturer'));
    app.use('/api/builders', require('./api/builder'));
    app.use('/api/products', require('./api/product'));
    app.use('/api/components', require('./api/component'));
    app.use('/api/aircrafts', require('./api/aircraft'));
    app.use('/api/afiles', require('./api/afile'));
    app.use('/api/owners', require('./api/owner'));
    app.use('/api/inspections', require('./api/inspection'));
    app.use('/api/insgroups', require('./api/insgroup'));
    app.use('/api/certificates', require('./api/certificate'));
    app.use('/api/flightsafeties', require('./api/flightsafety'));
    app.use('/api/maintenances', require('./api/maintenance'));

    app.use('/auth', require('./auth'));

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

    // All other routes should redirect to the index.html
    app.route('/*')
    .get(function (req, res) {
        res.sendfile(app.get('appPath') + '/index.html');
    });
};
