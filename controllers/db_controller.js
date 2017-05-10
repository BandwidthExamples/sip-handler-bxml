const debug = require('debug')('sip-handler');
const _ = require('underscore');
var sequelize = require('./../models/index').sequelize;
let app = require('./../index');

let SIPBinding = app.get('models').SIPBinding;
let db = {};

module.exports.saveBinding = (req, res, next) => {
	debug('Saving new Binding');
	const newNumber = req.newNumber;
	const newEndpoint = req.endpoint;
	const bindingValue = {
		sipUri          : newEndpoint,
		number          : newNumber,
		password        : req.body.password,
		bwEndpointId    : req.newEndpointId,
		bwPhoneNumberId : req.newNumberId
	}
	SIPBinding.create(bindingValue)
	.then( (binding) => {
		debug('New binding saved as: ' + binding.uuid);
		req.uuid = binding.uuid;
		next();
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

module.exports.updateBinding = (req, res, next) => {
	const bindingId = req.params.bindingId;
	debug('Updating bindingID: ' + bindingId);
	const params = req.body;
	debug('With Params: ');
	SIPBinding.update(params,
	{
		where: { uuid: bindingId },
		returning: true
	})
	.then( binding => {
		debug('Updated Record!')
		debug(binding[1][0].dataValues);
		next();
	})
	.catch( reason => {
		debug(reason);
		next(reason);
	})
};


module.exports.deleteBinding = (req, res, next) => {
	const bindingId = req.params.bindingId;
	debug('deleting bindingID: '+ bindingId);
	SIPBinding.update({
		deleted: true
		}, {
		where: {
			uuid: bindingId
		},
		returning: true
	})
	.then( binding => {
		debug('Updated Record!')
		debug(binding[1][0].dataValues);
		next();
	})
	.catch( reason => {
		debug(reason);
		next(reason);
	})
}

module.exports.getBindingFull = (req, res, next) => {
	const bindingId = (req.params.bindingId || req.uuid);
	debug('Finding Binding: ' + bindingId);
	SIPBinding.findAll({
		where: {
			$and: {
				uuid: bindingId,
				deleted: false
			}
		},
		limit: 1
	})
	.then( bindings => {
		req.binding = bindings[0];
		next();
	})
	.catch( (reason) => {
		debug(reason);
		let err = new Error('Couldn\'t fetch from database');
		next(err);
	});
};

module.exports.getBinding = (req, res, next) => {
	const bindingId = (req.params.bindingId || req.uuid);
	debug('Finding Binding: ' + bindingId);
	SIPBinding.findAll({
		where: {
			$and: {
				uuid: bindingId,
				deleted: false
			}
		},
		attributes: ['uuid', 'number', 'password', 'enabled', 'sipUri'],
		limit: 1
	})
	.then( bindings => {
		req.binding = bindings[0];
		next();
	})
	.catch( (reason) => {
		debug(reason);
		let err = new Error('Couldn\'t fetch from database');
		next(err);
	});
};

module.exports.listBindings = (req, res, next) => {
	debug('Returning Bindings');
	SIPBinding.findAll({
		where: {
			deleted: false
		},
		attributes: ['uuid', 'number', 'password', 'enabled', 'sipUri']
	})
	.then( (bindings) => {
		req.bindings = bindings;
		next();
	})
	.catch( (reason) => {
		debug(reason);
		let err = new Error('Couldn\'t fetch from database');
		next(err);
	});
}