'use strict';

var express = require('express');
var controller = require('./certificate.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/last', controller.getLastCert);
router.get('/next', controller.getNextNo);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;