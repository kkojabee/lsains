/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /certificates              ->  index
 * POST    /certificates              ->  create
 * GET     /certificates/:id          ->  show
 * PUT     /certificates/:id          ->  update
 * DELETE  /certificates/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var certificate = require('./certificate.model');
var inspection = require('../inspection/inspection.model');
var afile = require('../afile/afile.model');
var helper = require('../base/helper');
var popQuery = [{ path: '_aircraft', model: 'Aircraft' },
                { path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile'}];

// Get list of certificates
exports.index = function (req, res) {
    var query = req.query;

    var search = (query.search != undefined) ? query.search : null;
    var select = (query.select != undefined) ? query.select : null;
    var perPage = (query.perPage != undefined) ? query.perPage : 10000;
    var page = (query.page != undefined) ? query.page : 0;
    var sort = (query.sort != undefined) ? query.sort : { cert_no: 1 };

    certificate.find(search)
        .limit(perPage)
        .skip(perPage * page)
        .sort(sort)
        .populate(popQuery).exec(function (err, data) {
            if (err) { return handleError(res, err); }
            
            certificate.count(search, function (err, count) {
                if (err) { return handleError(res, err); }
                res.setHeader('Cache-Control', 'public, max-age=0');
                
                return res.json(200, {
                    count: count,
                    result: data,
                    type: 'certificate'
                });
            });
        });
};

// Get a single certificate
exports.show = function(req, res) {
    console.log('certificate api show');
    certificate.findById(req.params.id).populate(popQuery).exec(function (err, data) {
        if (err) { return handleError(res, err); }
        if (!data) { return res.send(404); }
        return res.json(data);
    });
};

// Get list of certificates
exports.getNextNo = function (req, res) {
    var lsa_category = req.query.lsa_category;
    var type = req.query.type;

    if (!lsa_category || !type)
        return handleError(res, 'query error!');

    certificate.getNextCertNo(lsa_category, type, function (err, cert_no){
        if (err) { return handleError(res, err); }
        res.setHeader('Cache-Control', 'public, max-age=0');
        return res.json(200, { cert_no: cert_no });
    });
};

// Get previous valid 
exports.getLastCert = function (req, res) {
    var aircraft = req.query.aircraft;
    var type = req.query.type;
    var date_pub = req.query.date_pub;
    var valid = req.query.valid;
    var cert_no = req.query.cert_no;

    if (!type || !aircraft)
        return handleError(res, 'query error!');

    if (valid === 'true' || valid === 'false') 
        valid = (valid.toLowerCase() === 'true') ? true : false;
    else
        valid = null;

    if (cert_no ==  null || cert_no == undefined)
        cert_no = null;

    certificate.getLastCert(aircraft, type, valid, cert_no, function (err, lastcert){
        if (err) { return handleError(res, err); } 
        res.setHeader('Cache-Control', 'public, max-age=0');
        if (!date_pub && lastcert) {
            if (lastcert.date_end < date_pub)
                lastcert = null;
        }
        return res.json(200, { lastcert: lastcert });
    });
};

var unpopulateCertificate = function (body) {   
    helper.unpopafile(body);
    helper.unpopids(body, ['_aircraft', '_inspection']);
}

// Creates a new certificate in the DB.
exports.create = function (req, res) {
    unpopulateCertificate(req.body);
    certificate.create(req.body, function (err, data) {
        if (err) { return handleError(res, err); }
        certificate.populate(data, popQuery, function (err, data) {
            if (err) { return handleError(res, err); }
            if (!data) { return res.send(404); }
            return res.json(201, data);
        });
    });
};

// Updates an existing certificate in the DB.
exports.update = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    unpopulateCertificate(req.body);

    certificate.findById(req.params.id).exec(function (err, data) {
        if (err) { console.log('certificate update error: ', err); return handleError(res, err); }
        if (!data) { console.log('certificate update error: not found'); return res.send(404); }
        var updated = _.merge(data, req.body);
        
        updated._afiles = req.body._afiles;
        updated._aimages = req.body._aimages;

        updated.markModified('_afiles');
        updated.markModified('_aimages');

        updated.save(function (err) {
            if (err) { console.log('certificate update error: ', err); return handleError(res, err); }
            certificate.findById(req.params.id).populate(popQuery).exec(function (err, data) {
                if (err) { console.log('certificate update error: ', err); return handleError(res, err); }
                return res.json(200, data);
            });
        });
    });
};

// Deletes a certificate from the DB.
exports.destroy = function (req, res) {
    certificate.findById(req.params.id, function (err, certificate) {
        if (err) { return handleError(res, err); }
        if (!certificate) { return res.send(404); }

        var id = certificate._id;
        certificate.remove(function (err) {
            if (err) { return handleError(res, err); }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
  return res.send(500, err);
}