const express = require('express');
let router = module.exports = express.Router();
const debug = require('debug')('sip-handler');
const bindings = require('../controllers/bindings_controller.js');
const bw = require('../controllers/bw_controller.js');
const db = require('../controllers/db_controller.js');

router.route('/')
	.post(
		bindings.validateMessage,
		bw.createEndpoint,
		bw.getNewNumber,
		db.saveBinding,
		db.getBinding,
		bindings.sendNewBinding
		)
	.get(
		db.listBindings,
		bindings.sendBindings
		);

router.route('/:bindingId')
	.get(
		db.getBinding,
		bindings.sendBinding
		)
	.post(
		bindings.validateUpdate,
		db.getBindingFull,
		bindings.checkIfExists,
		bw.updateEndpoint,
		db.updateBinding,
		db.getBinding,
		bindings.sendBinding
		)
	.delete(
		db.getBindingFull,
		bindings.checkIfExists,
		bw.deleteEndpoint,
		bw.deletePhoneNumber,
		db.deleteBinding,
		bindings.send200
		)