const Bandwidth = require('node-bandwidth');

const userId = process.env.BANDWIDTH_USER_ID;
const apiToken = process.env.BANDWIDTH_API_TOKEN;
const apiSecret = process.env.BANDWIDTH_API_SECRET;


if (!userId || !apiToken || !apiSecret ) {
  throw new Error('Invalid or non-existing Bandwidth credentials. \n Please set your: \n * userId \n * apiToken \n * apiSecret');
}

const bwApi = new Bandwidth({
  userId    : userId,
  apiToken  : apiToken,
  apiSecret : apiSecret
});

module.exports = bwApi;