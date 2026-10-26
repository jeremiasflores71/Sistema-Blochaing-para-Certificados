const crypto = require('node:crypto');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const canonical = data => JSON.stringify(Object.fromEntries(Object.keys(data).sort().map(key => [key, data[key]])));
module.exports = {
  sha,
  canonical
};
