const express = require('express');
let router = module.exports = express.Router();
const bw = require('../controllers/bw_controller.js');
const db = require('../controllers/db_controller.js');
const debug = require('debug')('sip-handler');

router.route('/messages')
	.post(
		bw.validateMessage,
		bw.sendMessage
		);

router.route('/calls')
	.post(
		bw.validateCall,
		bw.checkEvent,
		db.findNumbers,
		bw.transferCall
		);