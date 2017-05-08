const express = require('express');
let router = module.exports = express.Router();
const debug = require('debug')('sip-handler');
const bw = require('../controllers/bw_controller.js');
const db = require('../controllers/db_controller.js');
const view = require('../controllers/view_controller.js');

router.route('/')
	.get(
		bw.checkOrCreateApplication,
		bw.checkOrCreateDomain,
		view.serveHtml
		);
