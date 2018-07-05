const Bandwidth = require('node-bandwidth');
const bwApi = require('./bandwidth.js');
const debug = require('debug')('sip-handler');

module.exports.validateMessage = (req, res, next) => {
	debug('Validating new message');
	debug(req.query);
	res.sendStatus(200);
	next();
};

module.exports.validateCall = (req, res, next) => {
	debug('Validating new call');
	debug(req.query);
	next();
};

module.exports.checkEvent = (req, res, next) => {
	debug('Checking event type');
	const eventType = req.query.eventType;
	debug(eventType);
	if (eventType === 'answer') {
		next();
	}
	else {
		debug('Don\'t care about this event');
		res.sendStatus(200);
		return;
	}
};

module.exports.transferCall = (req, res, next) => {
	const bxml = new Bandwidth.BXMLResponse();
	if (req.bindingExists) {
		/** Build the BXML
		* <Response>
		* <Transfer transferTo={req.transferTo} transferCallerId={req.transferCallerId}>
		* 	<Record multiChannel=true/>
		* </Transfer>
		* </Response>
		**/
		bxml.transfer({
			transferTo: req.transferTo,
			transferCallerId: req.transferCallerId
		}, function() {
			this.record({
				multiChannel: true
			});
		});
	}
	else {
		/** Build the BXML
		* <Response>
		* <Hangup/>
		* </Response>
		**/
		bxml.hangup();
	}
	debug(bxml.toString());
	res.send(bxml.toString());
}

module.exports.sendMessage = (req, res, next) => {
	debug('Sending message');
	debug(req.query);
	const message = {
		to: req.query.from,
		from: req.query.to,
		text: 'SMS and MMS are not supported natively over SIP'
	}
	bwApi.Message.send(message)
	.then((message) => {
		req.sentMessage = message;
		debug('Message Sent');
		debug(message);
	})
	.catch( (reason) => {
		debug(reason);
	});
};