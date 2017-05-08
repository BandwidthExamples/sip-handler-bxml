const express = require('express');
let router = module.exports = express.Router();
const debug = require('debug')('sip-handler');
const bindings = require('../controllers/bindings_controller.js');
const bw = require('../controllers/bw_controller.js');
const db = require('../controllers/db_controller.js');

router.route('/')
	.post(
		bindings.validateMessage,
		bw.getNewNumber,
		bw.createEndpoint,
		db.saveBinding
		)
	.get(
		db.listBindings
		);
