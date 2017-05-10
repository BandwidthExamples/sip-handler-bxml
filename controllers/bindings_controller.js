const db = require('./db_controller.js');
const debug = require('debug')('sip-handler');
const Joi = require('joi');

const sipSchema = Joi.object().keys({
	name: Joi.string().min(3).max(32).required(),
	password: Joi.string().min(6).required()
});

module.exports.validateMessage = (req, res, next) => {
	const validateResult = Joi.validate(req.body, sipSchema);
	if (validateResult.error){
		var err = new Error('Must include name and password greater than 6 characters');
		err.status = 400;
		next(err);
	}
	else {
		next();
	}

};

const updateSchema = Joi.object().keys({
	enabled: Joi.boolean(),
	password: Joi.string().min(6)
});

module.exports.validateUpdate = (req, res, next) => {
	const validateResult = Joi.validate(req.body, updateSchema);
	if (validateResult.error){
		var err = new Error('Bad Request');
		err.status = 400;
		next(err);
	}
	else {
		next(err);
	}
}

module.exports.sendBinding = (req, res, next) => {
	if (!req.binding) {
		res.status(404).send();
	}
	else {
		res.status(200).send(req.binding);
	}
}

module.exports.checkIfExists = (req, res, next) => {
	if (!req.binding) {
		res.status(404).send();
	}
	else {
		next();
	}
}

module.exports.sendNewBinding = (req, res, next) => {
	res.status(201).send(req.binding);
}

module.exports.sendBindings = (req, res, next) => {
	res.status(200).send(req.bindings);
}

module.exports.send200 = (req, res, next) => {
	res.status(200).send();
}

