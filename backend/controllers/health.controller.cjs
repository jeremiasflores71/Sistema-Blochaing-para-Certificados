const chain = require('../services/blockchain.service.cjs');
async function health(req, res) {
  try {
    res.json({
      api: true,
      database: true,
      blockchain: await chain.check()
    });
  } catch {
    res.status(503).json({
      api: true,
      database: true,
      error: 'Blockchain no disponible'
    });
  }
}
module.exports = {
  health
};
