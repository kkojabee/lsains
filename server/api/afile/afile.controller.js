

/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /afiles              ->  index
 * POST    /afiles              ->  create
 * GET     /afiles/:id          ->  show
 * PUT     /afiles/:id          ->  update
 * DELETE  /afiles/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var path = require('path');
var os = require('os');
var fs = require('fs');
var Busboy = require('busboy');
var uuid = require('node-uuid');
var mongoose = require('mongoose');
var afile = require('./afile.model');
var popQuery = null;
//var basePath = __dirname + '\\..\\uploaded\\';
var basePath = afile.basePath;

// Get list of afiles
exports.index = function (req, res) {
    var query = req.query;

    var search = (query.search != undefined) ? query.search : null;
    var select = (query.select != undefined) ? query.select : null;
    var perPage = (query.perPage != undefined) ? query.perPage : 10000;
    var page = (query.page != undefined) ? query.page : 0;
    var sort = (query.sort != undefined) ? query.sort : { _id: 1 };

    afile.find(search)
        .limit(perPage)
        .skip(perPage * page)
        .sort(sort).exec(function (err, data) {
            if (err) { return handleError(res, err); }
            
            afile.count(search, function (err, count) {
                if (err) { return handleError(res, err); }
                res.setHeader('Cache-Control', 'public, max-age=0');
                
                return res.json(200, {
                    count: count,
                    result: data,
                    type: 'afile'
                });
            });
        });
};

// Get a single afile
exports.show = function (req, res) {
    afile.findById(req.params.id, function (err, afile) {
        if (err) { return handleError(res, err); }
        if (!afile) { return res.send(404); }
        return res.json(afile);
    });
};

// Download a single afile
exports.download = function (req, res) {
    afile.findById(req.params.id, function (err, afile) {
        if (err) { return handleError(res, err); }
        if (!afile) { return res.send(404); }

        var uuid_path = path.resolve(basePath + afile.uuid_name);
        fs.readFile(uuid_path, function (err, data) {
            if (err) return handleError(res, err);
            res.writeHead(200, { 
                'Content-disposition': 'attachment; filename=' + encodeURI(afile.file_name),
                'Content-type': afile.mime_type
            });
            res.end(data, 'binary');
        });

        /* node.js stream has error!!!!
        res.setHeader('Content-disposition', 'attachment; filename=' + afile.file_name);
        res.setHeader('Content-type', afile.mime_type);
        var readStream = fs.createReadStream(uuid_path, 'binary');
        readStream.pipe(res);
        */
    });
};

// Creates a new afile in the DB.
exports.create = function (req, res) {
    try {
        var mime_type, uuid_name, file_name, ext_name, max_file_size = (20 * 1024 * 1024 + 1);
        var busboy = new Busboy({ headers: req.headers, limits: { fileSize: max_file_size} });

        busboy.on('file', function (fieldname, file, file_name, encoding, mime_type) {
            var file_size = 0;
            uuid_name = uuid.v4().toString();
            ext_name = path.extname(file_name).substring(1).toString();

            if (busboy.opts.headers['content-length']) {
                var clength = parseInt(busboy.opts.headers['content-length']);
                if (clength > max_file_size) 
                    return handleError(res, '허용 가능한 최대 파일 크기를 초과했습니다.');
            }

            var uuid_path = basePath + uuid_name;
            file.pipe(fs.createWriteStream(uuid_path));

            file.on('data', function (data) {
                file_size += data.length;
                if (file_size >= max_file_size) {
                    fs.unlink(uuid_path);
                    return handleError(res, '허용 가능한 최대 파일 크기를 초과했습니다.');
                }
            });

            file.on('end', function () {
                var doc = {
                    file_type: fieldname,
                    mime_type: mime_type,
                    uuid_name: uuid_name,
                    file_name: file_name,
                    ext_name: ext_name,
                    file_size: file_size
                };

                afile.create(doc, function (err, afile) {
                    if (err) { return handleError(res, err); }
                    res.setHeader('Connection', 'close');
                    return res.json(200, { afile: afile });
                });
            });
        });

        busboy.on('finish', function () {
            //console.log('busboy finish');
        });


        return req.pipe(busboy);
    }
    catch (err) {
        return res.json(500, 'File uploading error!');
    }
};

// Updates an existing afile in the DB.
exports.update = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    afile.findById(req.params.id, function (err, afile) {
        if (err) { return handleError(res, err); }
        if (!afile) { return res.send(404); }
        var updated = _.merge(afile, req.body);
        updated.save(function (err) {
            if (err) { return handleError(res, err); }
            return res.json(200, afile);
        });
    });
};

// Deletes a afile from the DB.
exports.destroy = function (req, res) {
    afile.findById(req.params.id, function (err, afile) {
        if (err) { return handleError(res, err); }
        if (!afile) { return res.send(404); }

        afile.remove(function (err) {
            if (err) { return handleError(res, err); }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    console.log('err: ', err);
    res.setHeader('Connection', 'close');
    res.send(500, err);
    return res.end();
}