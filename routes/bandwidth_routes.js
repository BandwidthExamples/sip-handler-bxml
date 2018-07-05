const express = require('express');
let router = module.exports = express.Router();
const bxml = require('../controllers/bxml_controller.js');
const db = require('../controllers/db_controller.js');
const debug = require('debug')('sip-handler');

router.route('/messages')
	.get(
		bxml.validateMessage,
		bxml.sendMessage
		);

router.route('/calls')
	.get(
		bxml.validateCall,
		bxml.checkEvent,
		db.findNumbers,
		bxml.transferCall
		);