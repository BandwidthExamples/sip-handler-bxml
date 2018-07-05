// Old file using the REST API to control the call flow

const debug = require('debug')('sip-handler');
const bwApi = require('bandwidth.js');

module.exports.validateMessage = (req, res, next) => {
  debug('Validating new message');
  debug(req.body);
  res.sendStatus(200);
  next();
};

module.exports.validateCall = (req, res, next) => {
  debug('Validating new call');
  debug(req.body);
  res.sendStatus(200);
  next();
};

module.exports.checkEvent = (req, res, next) => {
  debug('Checking event type');
  const eventType = req.body.eventType;
  debug(eventType);
  if (eventType === 'answer') {
    next();
  }
  else {
    debug('Don\'t care about this event');
    return;
  }
};

module.exports.transferCall = (req, res, next) => {
  const callId = req.body.callId
  if (req.bindingExists) {
    const transfer = {
      transferTo: req.transferTo,
      transferCallerId: req.transferCallerId
    };
    bwApi.Call.transfer(callId, transfer)
    .then( (transferId) => {
      debug('Call Transfered! TransferId: ' + transferId);
      return
    })
    .catch( (reason) => {
      debug(reason);
    });
  }
  else {
    bwApi.Call.hangup(callId)
    .then( () => {
      debug('Call binding incorrect');
    })
    .catch( (reason) => {
      debug(reason);
    })
  }
}

module.exports.sendMessage = (req, res, next) => {
  debug('Sending message');
  debug(req.body);
  const message = {
    to: req.body.from,
    from: req.body.to,
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