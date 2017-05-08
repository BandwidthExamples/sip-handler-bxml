const debug = require('debug')('sip-handler');
const _ = require('underscore');
var sequelize = require('./../models/index').sequelize;
let app = require('./../index');

let Binding = app.get('models').Binding;
let db = {};

module.exports.saveBinding = (req, res, next) => {
	debug('Saving new Binding');
	const newNumber = req.newNumber;
	const newEndpoint = req.endpoint;
	const bindingValue = {
		sipUri: newEndpoint,
		number: newNumber,
		password: req.body.password
	}
	Binding.create(bindingValue)
	.then( (binding) => {
		debug('New binding saved as: ${bindingValue}');
		res.status('201').send(bindingValue);
	})
	.catch( (reason) => {
		debug(reason);
		const err = new Error('Couldn\'t save to database');
		err.status = 500;
		next(err);
	});

};


const getNumberFromSIP = function(sip) {
	return Binding.find({
		where: {
			sipUri: sip
		}
	})
	.then( (binding) => {
		if (binding) {
			return binding.number;
		}
	})
	.catch( (reason) => {
		debug(reason);
		let err = new Error('Couldn\'t find SIP uri in the database')
		throw(err);
	});
}

const getSIPFromNumber = function(number) {
	return Binding.find({
		where: {
			number: number
		}
	})
	.then( (binding) => {
		if (binding) {
			return binding.sipUri;
		}
	})
	.catch( (reason) => {
		debug(reason);
		let err = new Error('Couldn\'t find number in the database')
		throw(err);
	});
}

module.exports.findNumbers = (req, res, next) => {
	debug('Finding number bindings');
	const to = req.body.to;
	const from_ = req.body.from;
	if (from_.startsWith('sip')) {
		getNumberFromSIP(from_)
		.then(function (number) {
			req.bindingExists = true;
			req.transferTo = to;
			req.transferCallerId = number;
			next();
		})
		.catch( (reason) => {
			debug(reason);
			next(reason);
		})
	}
	else {
		getSIPFromNumber(to)
		.then(function (sip) {
			req.bindingExists = true;
			req.transferTo = sip;
			req.transferCallerId = from_;
			next();
		})
		.catch( (reason) => {
			debug(reason);
			next(reason);
		})
	}
};

module.exports.listBindings = (req, res, next) => {
	debug('Returning Bindings');
	Binding.findAll()
	.then( (bindings) => {
		res.status(200).send(bindings);
	})
	.catch( (reason) => {
		debug(reason);
		let err = new Error('Couldn\'t fetch from database');
		next(err);
	});
}