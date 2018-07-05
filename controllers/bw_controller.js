const _ = require('underscore');
const debug = require('debug')('sip-handler');
let app = require('../index.js');
const areaCodes = ['919', '415']
const bwApi = require('./bandwidth.js');
const domainName = process.env.BANDWIDTH_DOMAIN_NAME;

if(!domainName) {
  throw new Error('Must specifiy unique domain name!');
}

module.exports.getNewNumber = (req, res, next) => {
	debug('Searching for new binding number');
	// Order number from bandwidth
	let newNumber = '';
	bwApi.AvailableNumber.searchAndOrder('local', {
		areaCode : areaCodes[0],
		quantity : 1
	})
	.then((numbers) => {
		debug(numbers);
		// Make number name the two numbers binded
		newNumber = numbers[0].number;
		req.newNumberId = numbers[0].id;
		debug('Found New Number: ' + newNumber);
		// Need number id to update
		const numberId = numbers[0].id;
		// Assign number to application
		debug('Updating Number to application: ' + app.applicationId);
		return bwApi.PhoneNumber.update(numberId, {
			applicationId: app.applicationId
		});
	})
	.then( () => {
		debug('Assigned number: ' + newNumber + ' to application');
		req.newNumber = newNumber;
		next();
	})
	.catch( (reason) => {
		debug(reason);
		next(reason);
	});
};

module.exports.updateEndpoint = (req, res, next) => {
	const endpointId = req.binding.bwEndpointId;
	debug('Updating endpoint:  ' + endpointId);
	let params = _.clone(req.body);
	if (_.has(params, 'password')) {
		params.credentials = {
			password: params.password
		};
		delete params.password;
	}
	bwApi.Endpoint.update(app.domainId, endpointId, params)
	.then( () => {
		next();
	})
	.catch( reason => {
		debug(reason);
		next(reason);
	});
}

module.exports.deleteEndpoint = (req, res, next) => {
	const endpointId = req.binding.bwEndpointId;
	debug('Deleting endpoint: ' +endpointId);
	bwApi.Endpoint.delete(app.domainId, endpointId)
	.then( () => {
		next();
	})
	.catch( reason => {
		debug(reason);
		next(reason);
	});
}

module.exports.deletePhoneNumber = (req, res, next) => {
	const numberId = req.binding.bwPhoneNumberId;
	debug('Deleting phone number: ' + numberId);
	bwApi.PhoneNumber.delete(numberId)
	.then( () => {
		next();
	})
	.catch( reason => {
		debug(reason);
		next(reason);
	});
}


module.exports.createEndpoint = (req, res, next) => {
	debug('Creating Endpoint');
	debug(req.body);
	const endpointParams = {
		name: req.body.name,
		applicationId: app.applicationId,
		credentials: {
			password: req.body.password
		}
	};
	bwApi.Endpoint.create(app.domainId, endpointParams)
	.then( (endpoint) => {
		debug('Endpoint created');
		debug(endpoint);
		req.newEndpointId = endpoint.id;
		return bwApi.Endpoint.get(app.domainId, endpoint.id)
		.then( (value) => {
			debug(value);
			req.endpoint = value.sipUri
			next();
		})
	})
	.catch( (reason) => {
		debug(reason.message);
		let err = new Error(reason.message);
		err.status = reason.statusCode;
		next(err);
	});
};

/**
 * Below here is setup logic. This is only run once per instance of this application
 * The main use of the logic below is for one click deployments. Most likely,
 * you would NOT need this in a production envirnonment.
 *
 * This handles the oddness of heroku sleep and not knowing the heroku url until
 * deploying.
 */

module.exports.checkOrCreateDomain = (req, res, next) => {
	if (app.domainId) {
		next();
		return;
	}
	bwApi.Domain.list({
		size: 1000
	})
	.then( (domains) => {
		const domainId = searchForNameInList(domains.domains, domainName);
		if (domainId !== false) {
			debug('Domain Found: ' + domainId);
			app.domainId = domainId;
			next();
		}
		else {
			debug('No Domain Found');
			const description = app.rootName + ' on ' +app.callbackUrl;
			return bwApi.Domain.create({
				name: domainName,
				description: description
			})
			.then( (domain) => {
				debug('Created domain: ' + domain.id);
				app.domainId = domain.id;
				next();
			});
		}
	})
	.catch( (reason) => {
		debug(reason);
		next(reason);
	});
}

//Checks the current Applications to see if we have one.
module.exports.checkOrCreateApplication = (req, res, next) => {
	if (app.applicationId) {
		next();
		return;
	}
	app.callbackUrl = getBaseUrlFromReq(req);
	const appName = app.rootName + ' on ' +app.callbackUrl;
	debug('appName: ' + appName);
	bwApi.Application.list({
		size: 1000
	})
	.then( (apps) => {
		const appId = searchForNameInList(apps.applications, appName);
		if(appId !== false) {
			debug('Application Found: ' + appId);
			app.applicationId = appId;
			next();
		}
		else {
			debug('No Application Found');
			return newApplication(appName, app.callbackUrl)
			.then( (application) => {
				debug('Created Application: ' + application.id);
				app.applicationId = application.id;
				next();
			});
		}
	})
	.catch( (reason) => {
		debug(reason);
		next(reason);
	});
};

// Searches for applicatoin by name
const searchForNameInList = (list, name) => {
	for (var i = 0; i < list.length; i+=1) {
			if ( list[i].name === name) {
				return list[i].id;
			}
		}
	return false;
};

// Creates a new application with callbacks set to this server
const newApplication = (appName, url) => {
	return bwApi.Application.create({
		name: appName,
		incomingMessageUrl: url + '/bandwidth/messages',
		incomingCallUrl: url + '/bandwidth/calls',
		callbackHttpMethod: 'get',
		autoAnswer: true
	});
};

const getBaseUrlFromReq = (req) => {
	return 'http://' + req.hostname;
};