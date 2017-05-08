const db = require('./db_controller.js');
const debug = require('debug')('sip-handler');

module.exports.validateMessage = (req, res, next) => {
	if (!req.body.name && req.body.password.length < 6){
		var err = new Error('Must include name and password greater than 6 characters');
		err.status = 400;
		next(err);
	}
	next();
};