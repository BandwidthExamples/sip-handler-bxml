const db = require('./db_controller.js');
const debug = require('debug')('sip-handler');
const Joi = require('joi');

const sipSchema = Joi.object().keys({
	name: Joi.string().min(3).max(15).required(),
	password: Joi.string().min(6).required()
})

module.exports.validateMessage = (req, res, next) => {
	const validateResult = Joi.validate(req.body, sipSchema);
	if (validateResult.error){
		var err = new Error('Must include name and password greater than 6 characters');
		err.status = 400;
		next(err);
	}
	next();
};